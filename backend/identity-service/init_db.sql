CREATE TABLE public."Usuarios" (
    "Id_Usuario" integer NOT NULL,
    "Nombre" character varying(150) NOT NULL,
    "Correo" character varying(255) NOT NULL,
    "Contrasena_Hash" character varying(255),
    "Proveedor_Auth" character varying(20) NOT NULL,
    "Google_Id" character varying(255),
    "url_Avatar" character varying(2048),
    "Rol" character varying(20),
    "Activo" boolean,
    "Fecha_Registro" date DEFAULT CURRENT_DATE NOT NULL,
    "Codigo_Vinculacion" character varying(5),
    sexo character varying(10) DEFAULT 'Otro'::character varying NOT NULL,
    "Telefono" character varying(30),
    CONSTRAINT ck_usuarios_sexo CHECK (((sexo)::text = ANY ((ARRAY['Hombre'::character varying, 'Mujer'::character varying, 'Otro'::character varying])::text[])))
);

CREATE SEQUENCE public."Usuarios_Id_Usuario_seq"
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public."Usuarios_Id_Usuario_seq" OWNED BY public."Usuarios"."Id_Usuario";
ALTER TABLE ONLY public."Usuarios" ALTER COLUMN "Id_Usuario" SET DEFAULT nextval('public."Usuarios_Id_Usuario_seq"'::regclass);
ALTER TABLE ONLY public."Usuarios" ADD CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("Id_Usuario");
ALTER TABLE ONLY public."Usuarios" ADD CONSTRAINT "Usuarios_Codigo_Vinculacion_key" UNIQUE ("Codigo_Vinculacion");

CREATE TABLE public."Dispositivos" (
    "Id_Dispositivo" integer NOT NULL,
    "Id_Usuario" integer NOT NULL,
    "Token_Hash" character varying(64) NOT NULL,
    "Activo" boolean NOT NULL,
    "Creado_En" timestamp with time zone DEFAULT now() NOT NULL,
    "Ultimo_Uso_En" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE SEQUENCE public."Dispositivos_Id_Dispositivo_seq"
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public."Dispositivos_Id_Dispositivo_seq" OWNED BY public."Dispositivos"."Id_Dispositivo";
ALTER TABLE ONLY public."Dispositivos" ALTER COLUMN "Id_Dispositivo" SET DEFAULT nextval('public."Dispositivos_Id_Dispositivo_seq"'::regclass);
ALTER TABLE ONLY public."Dispositivos" ADD CONSTRAINT "Dispositivos_pkey" PRIMARY KEY ("Id_Dispositivo");

CREATE TABLE public."Estados_Dispositivo" (
    "Id_Usuario" integer NOT NULL,
    "Bateria_Porcentaje" integer NOT NULL,
    "Bateria_Cargando" boolean DEFAULT false NOT NULL,
    "Actualizado_En" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_estado_dispositivo_bateria CHECK ((("Bateria_Porcentaje" >= 0) AND ("Bateria_Porcentaje" <= 100)))
);

ALTER TABLE ONLY public."Estados_Dispositivo" ADD CONSTRAINT "Estados_Dispositivo_pkey" PRIMARY KEY ("Id_Usuario");

CREATE TABLE public."Vinculaciones" (
    "Id_Vinculacion" integer NOT NULL,
    "Id_Familiar" integer NOT NULL,
    "Id_Adulto_Mayor" integer NOT NULL,
    "Fecha_Vinculacion" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Nombre_Circulo" character varying(100),
    "Rol_Adulto_Mayor" character varying(50),
    "Rol_Familiar" character varying(50)
);

CREATE SEQUENCE public."Vinculaciones_Id_Vinculacion_seq"
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public."Vinculaciones_Id_Vinculacion_seq" OWNED BY public."Vinculaciones"."Id_Vinculacion";
ALTER TABLE ONLY public."Vinculaciones" ALTER COLUMN "Id_Vinculacion" SET DEFAULT nextval('public."Vinculaciones_Id_Vinculacion_seq"'::regclass);
ALTER TABLE ONLY public."Vinculaciones" ADD CONSTRAINT "Vinculaciones_pkey" PRIMARY KEY ("Id_Vinculacion");

CREATE UNIQUE INDEX idx_dispositivos_token_hash ON public."Dispositivos" USING btree ("Token_Hash");
CREATE INDEX idx_dispositivos_usuario ON public."Dispositivos" USING btree ("Id_Usuario");
CREATE INDEX ix_Dispositivos_Id_Usuario ON public."Dispositivos" USING btree ("Id_Usuario");
CREATE UNIQUE INDEX ix_Dispositivos_Token_Hash ON public."Dispositivos" USING btree ("Token_Hash");

CREATE INDEX idx_estados_dispositivo_actualizado_en ON public."Estados_Dispositivo" USING btree ("Actualizado_En");

CREATE UNIQUE INDEX idx_usuarios_codigo_vinculacion ON public."Usuarios" USING btree ("Codigo_Vinculacion") WHERE ("Codigo_Vinculacion" IS NOT NULL);
CREATE INDEX idx_usuarios_correo ON public."Usuarios" USING btree ("Correo");
CREATE INDEX idx_usuarios_google_id ON public."Usuarios" USING btree ("Google_Id");
CREATE UNIQUE INDEX ix_Usuarios_Correo ON public."Usuarios" USING btree ("Correo");
CREATE UNIQUE INDEX ix_Usuarios_Google_Id ON public."Usuarios" USING btree ("Google_Id");

ALTER TABLE ONLY public."Dispositivos" ADD CONSTRAINT "Dispositivos_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES public."Usuarios"("Id_Usuario") ON DELETE CASCADE;
ALTER TABLE ONLY public."Dispositivos" ADD CONSTRAINT fk_dispositivos_usuario FOREIGN KEY ("Id_Usuario") REFERENCES public."Usuarios"("Id_Usuario") ON DELETE CASCADE;

ALTER TABLE ONLY public."Estados_Dispositivo" ADD CONSTRAINT fk_estado_dispositivo_usuario FOREIGN KEY ("Id_Usuario") REFERENCES public."Usuarios"("Id_Usuario") ON DELETE CASCADE;

ALTER TABLE ONLY public."Vinculaciones" ADD CONSTRAINT fk_adulto FOREIGN KEY ("Id_Adulto_Mayor") REFERENCES public."Usuarios"("Id_Usuario");
ALTER TABLE ONLY public."Vinculaciones" ADD CONSTRAINT fk_familiar FOREIGN KEY ("Id_Familiar") REFERENCES public."Usuarios"("Id_Usuario");