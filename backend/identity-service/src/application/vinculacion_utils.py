"""Utilidades de vinculación.

Lógica de parentescos recíprocos:
- El Adulto Mayor selecciona el rol del Familiar dentro del círculo.
- En la app del Familiar se muestra el parentesco del Adulto Mayor hacia el Familiar,
  ajustando por el sexo del Adulto Mayor cuando aplica.
"""


def _normalizar_texto(texto: str) -> str:
    return (texto or "").strip().lower()


def _normalizar_texto_sin_tildes(texto: str) -> str:
    # Evita depender de unicodedata para mantenerlo simple.
    reemplazos = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ü": "u",
        "ñ": "n",
    }

    base = _normalizar_texto(texto)
    for original, reemplazo in reemplazos.items():
        base = base.replace(original, reemplazo)
    return base


def normalizar_sexo(sexo: str) -> str:
    sexo_norm = _normalizar_texto_sin_tildes(sexo)
    if sexo_norm in ("hombre", "masculino", "m"):
        return "Hombre"
    if sexo_norm in ("mujer", "femenino", "f"):
        return "Mujer"
    return "Otro"


def calcular_parentesco_reciproco(relacion_seleccionada_por_am: str, sexo_adulto_mayor: str) -> str:
    """Calcula el parentesco que verá el Familiar respecto al Adulto Mayor.

    `relacion_seleccionada_por_am` corresponde a lo que el Adulto Mayor seleccionó
    para describir al Familiar (por ejemplo: "Hijo/Hija", "Mamá", "Papá").

    Retorna una etiqueta pensada para UI (p. ej. "Papá", "Mamá", "Hijo/Hija").
    """

    relacion_norm = _normalizar_texto_sin_tildes(relacion_seleccionada_por_am)
    if not relacion_norm:
        return "Adulto Mayor"

    sexo = normalizar_sexo(sexo_adulto_mayor)

    # AM selecciona el rol del Familiar. Aquí devolvemos el rol del AM para el Familiar.
    if "mama" in relacion_norm:
        return "Hijo" if sexo == "Hombre" else "Hija" if sexo == "Mujer" else "Hijo/Hija"

    if "papa" in relacion_norm or "padre" in relacion_norm:
        return "Hijo" if sexo == "Hombre" else "Hija" if sexo == "Mujer" else "Hijo/Hija"

    if "hijo" in relacion_norm:
        return "Papá" if sexo == "Hombre" else "Mamá" if sexo == "Mujer" else "Papá/Mamá"

    if "abuelo" in relacion_norm:
        return "Nieto" if sexo == "Hombre" else "Nieta" if sexo == "Mujer" else "Nieto/Nieta"

    if "nieto" in relacion_norm:
        return "Abuelo" if sexo == "Hombre" else "Abuela" if sexo == "Mujer" else "Abuelo/Abuela"

    if "pareja" in relacion_norm or "conyuge" in relacion_norm:
        return "Esposo" if sexo == "Hombre" else "Esposa" if sexo == "Mujer" else "Pareja/Cónyuge"

    if "amistad" in relacion_norm or "amigo" in relacion_norm:
        return "Amigo" if sexo == "Hombre" else "Amiga" if sexo == "Mujer" else "Amistad"

    if "otros" in relacion_norm:
        return "Familiar"

    # Si llega una relación no contemplada, devolvemos el texto original.
    return relacion_seleccionada_por_am
