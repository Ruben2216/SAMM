export const obtenerParentescoDelAdultoParaFamiliar = (
    rolDelFamiliarEnCirculo?: string | null,
): string => {
    const rol = (rolDelFamiliarEnCirculo ?? "").trim();
    if (!rol) return "Adulto Mayor";

    const rolNormalizado = rol
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // El adulto mayor selecciona el rol del familiar (p. ej. "Hijo/Hija").
    // En la app del familiar queremos mostrar el parentesco del adulto hacia el familiar.
    if (rolNormalizado.includes("hijo")) return "Papá/Mamá";
    if (rolNormalizado.includes("papa") || rolNormalizado.includes("mama"))
        return "Hijo/Hija";
    if (rolNormalizado.includes("abuelo")) return "Nieto/Nieta";
    if (rolNormalizado.includes("nieto")) return "Abuelo/Abuela";
    if (rolNormalizado.includes("pareja") || rolNormalizado.includes("conyuge"))
        return "Pareja";
    if (rolNormalizado.includes("amistad")) return "Amistad";
    if (rolNormalizado.includes("otros")) return "Familiar";

    return rol;
};
