-- =====================================================================
--  ESQUEMA PARA VENTA DE MOTOS  (ejecutar completo en SQL Editor)
--  Reemplaza las tablas anteriores (productos, clientes, etc.)
-- =====================================================================

-- 1. LIMPIAR
drop trigger if exists al_crear_usuario on auth.users;
drop function if exists public.registrar_venta(bigint, bigint[], text);
drop table if exists detalles, encabezados, motos, productos, clientes, usuarios cascade;
drop table if exists matriculas, cursos, materias, profesores, estudiantes cascade;

-- 2. TABLAS
create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text unique not null,
  rol text not null default 'Cliente' check (rol in ('Administrador', 'Cliente'))
);

create table clientes (
  id bigint generated always as identity primary key,
  cedula text unique not null,
  nombre_completo text not null,
  fecha_nac date,
  correo text unique not null,
  telefono text,
  direccion text
);

create table motos (
  id bigint generated always as identity primary key,
  marca text not null,
  modelo text not null,
  anio int not null check (anio between 1980 and 2100),
  cilindraje int not null check (cilindraje > 0),
  color text,
  condicion text not null default 'nueva' check (condicion in ('nueva', 'usada')),
  chasis text unique not null,          -- una fila = una moto física
  numero_motor text unique,
  placa text unique,
  kilometraje int not null default 0 check (kilometraje >= 0),
  precio numeric(14,2) not null check (precio > 0),
  estado text not null default 'disponible' check (estado in ('disponible', 'reservada', 'vendida')),
  creada_en timestamptz not null default now()
);

create table encabezados (
  id bigint generated always as identity primary key,
  id_cliente bigint not null references clientes(id),
  id_vendedor uuid references usuarios(id),
  fecha timestamptz not null default now(),
  forma_pago text not null default 'contado' check (forma_pago in ('contado', 'credito', 'transferencia')),
  total numeric(14,2) not null default 0
);

create table detalles (
  id bigint generated always as identity primary key,
  id_enc bigint not null references encabezados(id) on delete cascade,
  id_moto bigint not null unique references motos(id),   -- una moto solo se vende una vez
  precio_unitario numeric(14,2) not null                  -- precio al momento de la venta
);

-- 3. FUNCIONES
create or replace function public.es_admin()
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from usuarios where id = auth.uid() and rol = 'Administrador');
$$;

-- Al registrarse alguien: crea su fila en "usuarios" (siempre como Cliente)
-- y, si viene la cédula en los metadatos, su fila en "clientes".
create or replace function public.nuevo_usuario()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into usuarios (id, correo, rol) values (new.id, new.email, 'Cliente');

  if coalesce(new.raw_user_meta_data ->> 'cedula', '') <> '' then
    insert into clientes (cedula, nombre_completo, fecha_nac, correo, telefono)
    values (
      new.raw_user_meta_data ->> 'cedula',
      coalesce(new.raw_user_meta_data ->> 'nombre', new.email),
      nullif(new.raw_user_meta_data ->> 'fecha_nac', '')::date,
      new.email,
      nullif(new.raw_user_meta_data ->> 'telefono', '')
    );
  end if;
  return new;
end;
$$;

create trigger al_crear_usuario
after insert on auth.users
for each row execute function public.nuevo_usuario();

-- VENTA ATÓMICA: valida, marca las motos como vendidas y crea encabezado + detalle
create or replace function public.registrar_venta(
  p_id_cliente bigint,
  p_ids_motos bigint[],
  p_forma_pago text
)
returns bigint language plpgsql security definer
set search_path = public
as $$
declare
  v_enc bigint;
  v_total numeric;
  v_n int;
  v_pedidas int;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  if p_ids_motos is null or coalesce(array_length(p_ids_motos, 1), 0) = 0 then
    raise exception 'La venta no tiene motos';
  end if;

  -- un cliente solo puede registrar compras a su nombre
  if not es_admin() and not exists (
    select 1 from clientes where id = p_id_cliente and correo = auth.jwt() ->> 'email'
  ) then
    raise exception 'No puedes registrar ventas para otro cliente';
  end if;

  -- bloquea las motos para que nadie más las venda al mismo tiempo
  perform 1 from motos where id = any(p_ids_motos) order by id for update;

  select count(*), coalesce(sum(precio), 0) into v_n, v_total
  from motos where id = any(p_ids_motos) and estado = 'disponible';

  select count(distinct x) into v_pedidas from unnest(p_ids_motos) x;
  if v_n <> v_pedidas then raise exception 'Alguna moto ya no está disponible'; end if;

  insert into encabezados (id_cliente, id_vendedor, forma_pago, total)
  values (p_id_cliente, auth.uid(), p_forma_pago, v_total)
  returning id into v_enc;

  insert into detalles (id_enc, id_moto, precio_unitario)
  select v_enc, id, precio from motos where id = any(p_ids_motos);

  update motos set estado = 'vendida' where id = any(p_ids_motos);

  return v_enc;
end;
$$;

revoke execute on function public.registrar_venta(bigint, bigint[], text) from public, anon;
grant execute on function public.registrar_venta(bigint, bigint[], text) to authenticated;

-- 4. PERMISOS PARA LA API (solo usuarios con sesión)
grant select, insert, update, delete on usuarios, clientes, motos, encabezados, detalles to authenticated;

-- 5. SEGURIDAD A NIVEL DE FILA (RLS)
alter table usuarios    enable row level security;
alter table clientes    enable row level security;
alter table motos       enable row level security;
alter table encabezados enable row level security;
alter table detalles    enable row level security;

-- usuarios: cada uno ve su fila; el admin gestiona todas
create policy usuarios_propio on usuarios for select to authenticated using (id = auth.uid());
create policy usuarios_admin  on usuarios for all to authenticated using (es_admin()) with check (es_admin());

-- clientes: el admin todo; cada cliente ve y edita solo su registro
create policy clientes_admin  on clientes for all to authenticated using (es_admin()) with check (es_admin());
create policy clientes_propio on clientes for select to authenticated using (correo = auth.jwt() ->> 'email');
create policy clientes_editar on clientes for update to authenticated
  using (correo = auth.jwt() ->> 'email') with check (correo = auth.jwt() ->> 'email');

-- motos: todos los usuarios con sesión ven el catálogo; solo el admin lo modifica
create policy motos_ver   on motos for select to authenticated using (true);
create policy motos_admin on motos for all to authenticated using (es_admin()) with check (es_admin());

-- ventas: el admin ve todo; el cliente solo las suyas. Se crean con registrar_venta()
create policy enc_admin  on encabezados for all to authenticated using (es_admin()) with check (es_admin());
create policy enc_propio on encabezados for select to authenticated
  using (id_cliente in (select id from clientes where correo = auth.jwt() ->> 'email'));

create policy det_admin  on detalles for all to authenticated using (es_admin()) with check (es_admin());
create policy det_propio on detalles for select to authenticated
  using (id_enc in (
    select e.id from encabezados e join clientes c on c.id = e.id_cliente
    where c.correo = auth.jwt() ->> 'email'));

-- 6. TU USUARIO ACTUAL COMO ADMINISTRADOR
insert into usuarios (id, correo, rol)
select id, email, 'Administrador' from auth.users
on conflict (id) do update set rol = 'Administrador';

-- 7. DATOS DE PRUEBA (borra estas líneas cuando cargues tu inventario real)
insert into motos (marca, modelo, anio, cilindraje, color, condicion, chasis, numero_motor, placa, kilometraje, precio) values
  ('Yamaha', 'FZ 2.0',   2026, 149, 'Negro',  'nueva', 'DEMO-CHASIS-0001', 'DEMO-MOT-0001', null, 0,     10990000),
  ('Honda',  'CB 190R',  2026, 184, 'Rojo',   'nueva', 'DEMO-CHASIS-0002', 'DEMO-MOT-0002', null, 0,     11490000),
  ('Suzuki', 'Gixxer 150', 2023, 155, 'Azul', 'usada', 'DEMO-CHASIS-0003', 'DEMO-MOT-0003', 'ABC12D', 8200, 7900000);
