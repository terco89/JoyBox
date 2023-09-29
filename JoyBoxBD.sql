--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 15.3

-- Started on 2023-09-29 14:04:49

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3156 (class 1262 OID 16389)
-- Name: a_r3e5; Type: DATABASE; Schema: -; Owner: elpromaster
--

CREATE DATABASE a_r3e5 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';


ALTER DATABASE a_r3e5 OWNER TO elpromaster;

\connect a_r3e5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3157 (class 0 OID 0)
-- Name: a_r3e5; Type: DATABASE PROPERTIES; Schema: -; Owner: elpromaster
--

ALTER DATABASE a_r3e5 SET "TimeZone" TO 'utc';


\connect a_r3e5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: elpromaster
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO elpromaster;

--
-- TOC entry 218 (class 1255 OID 16397)
-- Name: amigo(integer, integer); Type: FUNCTION; Schema: public; Owner: elpromaster
--

CREATE FUNCTION public.amigo(idu integer, ida integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE mid integer;
BEGIN
  SELECT id_amigo INTO mid FROM amigos WHERE (id_user = idu OR id_user = ida) AND (id_amigo = idu OR id_amigo = ida);
  IF mid IS NULL THEN
  	RETURN False;
  ELSE
	RETURN True;
  END IF;
END;
$$;


ALTER FUNCTION public.amigo(idu integer, ida integer) OWNER TO elpromaster;

--
-- TOC entry 219 (class 1255 OID 16398)
-- Name: login(text, text); Type: FUNCTION; Schema: public; Owner: elpromaster
--

CREATE FUNCTION public.login(usuario text, contra text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE mid INTEGER;
BEGIN
  SELECT id INTO mid FROM usuarios WHERE nombre = usuario AND contraseña = md5(contra);
  RETURN mid;
END;
$$;


ALTER FUNCTION public.login(usuario text, contra text) OWNER TO elpromaster;

--
-- TOC entry 220 (class 1255 OID 16399)
-- Name: registrar(text, bigint, text, text, text); Type: FUNCTION; Schema: public; Owner: elpromaster
--

CREATE FUNCTION public.registrar(nom text, eda bigint, con text, rcon text, mail text) RETURNS text
    LANGUAGE plpgsql
    AS $$BEGIN
  IF NOT EXISTS(SELECT id FROM usuarios WHERE nombre = nom)THEN
	IF NOT EXISTS(SELECT id FROM usuarios WHERE correo = mail)THEN
		INSERT INTO usuarios(nombre,edad,correo,contraseña)
		VALUES(nom,eda,mail,MD5(con));
		RETURN 'exito';
	ELSE
		RETURN 'email';
	END IF;
  ELSE
  	RETURN 'nombre';
  END IF;
END;
$$;


ALTER FUNCTION public.registrar(nom text, eda bigint, con text, rcon text, mail text) OWNER TO elpromaster;

--
-- TOC entry 221 (class 1255 OID 16400)
-- Name: registrar(text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: elpromaster
--

CREATE FUNCTION public.registrar(nom text, eda text, con text, rcon text, mail text) RETURNS text
    LANGUAGE plpgsql
    AS $$BEGIN
  IF NOT EXISTS(SELECT id FROM usuarios WHERE nombre = nom)THEN
	IF NOT EXISTS(SELECT id FROM usuarios WHERE correo = mail)THEN
		INSERT INTO usuarios(nombre,edad,correo,contraseña)
		VALUES(nom,eda,mail,MD5(con));
		RETURN 'exito';
	ELSE
		RETURN 'email';
	END IF;
  ELSE
  	RETURN 'nombre';
  END IF;
END;
$$;


ALTER FUNCTION public.registrar(nom text, eda text, con text, rcon text, mail text) OWNER TO elpromaster;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 16401)
-- Name: amigos; Type: TABLE; Schema: public; Owner: elpromaster
--

CREATE TABLE public.amigos (
    id_user bigint,
    id_amigo bigint,
    fecha_baja date
);


ALTER TABLE public.amigos OWNER TO elpromaster;

--
-- TOC entry 215 (class 1259 OID 16404)
-- Name: mensajes; Type: TABLE; Schema: public; Owner: elpromaster
--

CREATE TABLE public.mensajes (
    usuario_id bigint,
    amigo_id bigint,
    mensaje text,
    fecha_baja date
);


ALTER TABLE public.mensajes OWNER TO elpromaster;

--
-- TOC entry 216 (class 1259 OID 16409)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: elpromaster
--

CREATE TABLE public.usuarios (
    nombre text,
    edad bigint,
    correo text,
    "contraseña" text,
    fecha_baja date,
    id integer NOT NULL
);


ALTER TABLE public.usuarios OWNER TO elpromaster;

--
-- TOC entry 217 (class 1259 OID 16414)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: elpromaster
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO elpromaster;

--
-- TOC entry 3158 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elpromaster
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 3004 (class 2604 OID 16415)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: elpromaster
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3147 (class 0 OID 16401)
-- Dependencies: 214
-- Data for Name: amigos; Type: TABLE DATA; Schema: public; Owner: elpromaster
--

INSERT INTO public.amigos (id_user, id_amigo, fecha_baja) VALUES (2, 3, NULL);


--
-- TOC entry 3148 (class 0 OID 16404)
-- Dependencies: 215
-- Data for Name: mensajes; Type: TABLE DATA; Schema: public; Owner: elpromaster
--

INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'WASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'quibo insan', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'sale un fornai o que', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'habla papu :,', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (3, 2, 'quien sos? bueno dal', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (3, 2, 'Albion online es un mmorpg no lineal, en el que escribes tu propia historia sin limitarte a seguir un camino prefijado, explora un amplio mundo abierto con 5 biomas únicos, todo cuanto hagas tendrá su repercusión en el mundo, con la economía orientada al jugador de Albión, los jugadores crean práct', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (3, 2, 'no me la creo se rompe x', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (3, 2, 'sdjsdaojdjs', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (3, 2, 'murio la programacio', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (3, 2, 'si estas leyendo esto te deseo un buen dia :) no como me sucede a mi :', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'quib', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'quib', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'a', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'a', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'c repite el msg p', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'c repite el msg p', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'xd', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'x', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'j', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'j', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'iiiiiiiiiiiiiiiiiiiiiiii', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'iiiiiiiiiiiiiiiiiiiiiii', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'o', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'o', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'vssvf', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'vssv', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'asscavsf', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'asscavs', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'When Gwen le dice ven a Ben', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'When Gwen le dice ven a Be', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'aaaaaaaa', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'aaaaaaa', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'jmn', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'jm', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'nmdeed', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'nmdee', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'jhggh', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'jhgg', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'sdasdsd', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'sdasds', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'sadsdaadsadsadsad', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'sadsdaadsadsadsa', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'ddsfsdf', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'ddsfsd', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 4, 'ahora si papu', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (3, 2, 'xd', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'asddsa', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'saddasd', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'adssdaasd', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'sdadasda', NULL);
INSERT INTO public.mensajes (usuario_id, amigo_id, mensaje, fecha_baja) VALUES (2, 3, 'adsdsa', NULL);


--
-- TOC entry 3149 (class 0 OID 16409)
-- Dependencies: 216
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: elpromaster
--

INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('si', 21, 'nosexd@xd.com', '7fa3b767c460b54a2be4d49030b349c7', NULL, 2);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('no', 23, 'shaijdf@has.com', 'ac5585d98646d255299c359140537783', NULL, 3);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('sur', 4, '.@a.', '40b3b3b949de10255cf2f677d5d3bc98', NULL, 4);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('affaf', 2, '...@s.com.co', '40b3b3b949de10255cf2f677d5d3bc98', NULL, 5);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('dsfsg', 3, '.@c.c.c.s.co', '40b3b3b949de10255cf2f677d5d3bc98', NULL, 6);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('sdasdsadsd', 3, '.@c.c.c.s.cos', '40b3b3b949de10255cf2f677d5d3bc98', NULL, 7);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('sdsasax', 3, 'aaadas@da.co', '40b3b3b949de10255cf2f677d5d3bc98', NULL, 8);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('ewerwre', 2, 'wqr@sada.co', 'befe94995c943b4504493772dc3df9f8', NULL, 9);
INSERT INTO public.usuarios (nombre, edad, correo, "contraseña", fecha_baja, id) VALUES ('sugdhd', 2, 'dsaf@nda.co', 'befe94995c943b4504493772dc3df9f8', NULL, 10);


--
-- TOC entry 3159 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elpromaster
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 10, true);


--
-- TOC entry 2048 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES  TO elpromaster;


--
-- TOC entry 2050 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES  TO elpromaster;


--
-- TOC entry 2049 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS  TO elpromaster;


--
-- TOC entry 2047 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES  TO elpromaster;


-- Completed on 2023-09-29 14:05:13

--
-- PostgreSQL database dump complete
--

