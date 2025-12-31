import pandas as pd
import numpy as np
import os

def clean_csv_for_sql_import_simple(input_file_name):
    """
    Lee un archivo CSV, reemplaza 'NULL' y comillas vacías con valores vacíos,
    SIN modificar los tipos de datos originales (mantiene 28 como 28, no como 28.0).

    Args:
        input_file_name (str): El nombre del archivo CSV a limpiar.

    Returns:
        str: El nombre del archivo CSV limpio generado, o None si hay un error.
    """
    if not os.path.exists(input_file_name):
        print(f"❌ Error: El archivo '{input_file_name}' no existe.")
        return None

    # 1. Definir el nombre del archivo de salida
    base, ext = os.path.splitext(input_file_name)
    output_file_name = f"{base}_simple_clean{ext}"

    print(f"🚀 Iniciando la limpieza de NULLs en el archivo: {input_file_name}")

    try:
        # 2. Leer el archivo como STRINGS para preservar los valores originales
        # dtype=str evita que pandas convierta 28 a 28.0
        df = pd.read_csv(
            input_file_name, 
            sep=',', 
            dtype=str,  # ← CLAVE: Lee todo como string
            keep_default_na=False,  # No interpreta valores como NA automáticamente
            engine='python'
        )
        
        print(f"✅ Lectura exitosa. Filas cargadas: {len(df)}")
        print(f"📊 Columnas encontradas: {len(df.columns)}")

        # 3. Reemplazar SOLO los valores 'NULL', '""' y espacios vacíos con NaN
        # Esto mantiene los números intactos (28 sigue siendo "28", no "28.0")
        df = df.replace({
            'NULL': np.nan,
            '""': np.nan,
            '': np.nan,
            ' ': np.nan
        })

        # 4. Guardar el archivo limpio
        # na_rep='' convierte los NaN en campos vacíos para SQL
        df.to_csv(
            output_file_name, 
            index=False, 
            header=True, 
            na_rep='',  # NaN se convierte en campo vacío
            encoding='utf-8',
            quoting=1  # QUOTE_MINIMAL: solo entrecomilla si es necesario
        )

        print(f"🎉 Limpieza completada y guardada en: {output_file_name}")
        print("✅ Los valores numéricos se mantienen sin decimales (28 sigue siendo 28)")
        return output_file_name

    except Exception as e:
        print(f"❌ Ocurrió un error durante la limpieza: {e}")
        import traceback
        traceback.print_exc()
        return None


# ===================================================================
# CÓMO LLAMAR LA FUNCIÓN
# ===================================================================

if __name__ == "__main__":
    # Define el nombre de tu archivo CSV aquí
    file_to_clean = 'odontblpacientes.csv' 
    
    # Llama a la función
    cleaned_file_name = clean_csv_for_sql_import_simple(file_to_clean)

    if cleaned_file_name:
        print(f"\n✨ Proceso finalizado exitosamente!")
        print(f"📁 Archivo listo para SQL: **{cleaned_file_name}**")
        print("\n💡 Notas importantes:")
        print("   - Los valores numéricos se mantienen sin decimales")
        print("   - Los campos NULL/vacíos se convierten en ''")
        print("   - Listo para importar con COPY FROM en PostgreSQL")
    else:
        print("\n❌ La limpieza falló. Revise los errores anteriores.")