import csv
import os
from collections import defaultdict

# Archivos de entrada
ARCHIVO_PRODUCTOS = 'InvtblProducto.csv'
ARCHIVO_PARAMETROS = 'OdontblParametrosGeneralesDet.csv'

# Carpeta de salida
CARPETA_SALIDA = 'normalizados'

# Archivos de salida
ARCHIVO_NOMBRES = os.path.join(CARPETA_SALIDA, 'nombres.csv')
ARCHIVO_CARACTERISTICAS = os.path.join(CARPETA_SALIDA, 'caracteristicas.csv')
ARCHIVO_MARCAS = os.path.join(CARPETA_SALIDA, 'marcas.csv')
ARCHIVO_PRODUCTOS_NORM = os.path.join(CARPETA_SALIDA, 'productos_normalizados.csv')

# Constantes para grupos de parámetros
GRUPO_NOMBRES = '19'
GRUPO_CARACTERISTICAS = '20'
GRUPO_MARCAS = '21'

def crear_carpeta_salida():
    """Crea la carpeta de salida si no existe"""
    if not os.path.exists(CARPETA_SALIDA):
        os.makedirs(CARPETA_SALIDA)
        print(f"📁 Carpeta '{CARPETA_SALIDA}/' creada\n")
    else:
        print(f"📁 Usando carpeta existente '{CARPETA_SALIDA}/'\n")

def leer_parametros():
    """
    Lee el archivo de parámetros y crea tres diccionarios separados:
    - nombres: siGrupoParametro = 19
    - caracteristicas: siGrupoParametro = 20
    - marcas: siGrupoParametro = 21
    """
    nombres_params = {}
    caracteristicas_params = {}
    marcas_params = {}
    
    total_lineas = 0
    sin_grupo = 0
    grupos_encontrados = defaultdict(int)
    
    try:
        # Intentar diferentes codificaciones
        encoding_usado = None
        for encoding in ['utf-8-sig', 'utf-8', 'latin-1', 'cp1252']:
            try:
                with open(ARCHIVO_PARAMETROS, 'r', encoding=encoding) as f:
                    primera_linea = f.readline()
                    # Verificar que la primera línea contiene las columnas esperadas
                    if 'siGrupoParametro' in primera_linea or 'siCodigoParametro' in primera_linea:
                        encoding_usado = encoding
                        print(f"   🔍 Encoding detectado: {encoding}")
                        break
            except:
                continue
        
        if not encoding_usado:
            encoding_usado = 'utf-8'
            print(f"   ⚠️  Usando encoding por defecto: utf-8")
        
        # Ahora leer con el encoding correcto
        with open(ARCHIVO_PARAMETROS, 'r', encoding=encoding_usado) as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                total_lineas += 1
                
                # Leer columnas
                grupo = row.get('siGrupoParametro', '').strip()
                id_param = row.get('siCodigoParametro', '').strip()
                nombre = row.get('vDescCodigoParametro', '').strip()
                
                # DEBUG: Imprimir primeras 5 líneas para diagnóstico
                if total_lineas <= 5:
                    print(f"   DEBUG Línea {total_lineas}: Grupo='{grupo}', ID='{id_param}', Nombre='{nombre[:30]}...'")
                
                # Contar grupos encontrados
                if grupo:
                    grupos_encontrados[grupo] += 1
                else:
                    sin_grupo += 1
                
                # Clasificar por grupo
                if id_param and nombre:
                    if grupo == GRUPO_NOMBRES:
                        nombres_params[id_param] = nombre
                    elif grupo == GRUPO_CARACTERISTICAS:
                        caracteristicas_params[id_param] = nombre
                    elif grupo == GRUPO_MARCAS:
                        marcas_params[id_param] = nombre
        
        print(f"   ✅ Total de líneas leídas: {total_lineas}")
        print(f"   📊 Distribución por grupos:")
        print(f"      • Grupo 19 (Nombres): {len(nombres_params)} parámetros")
        print(f"      • Grupo 20 (Características): {len(caracteristicas_params)} parámetros")
        print(f"      • Grupo 21 (Marcas): {len(marcas_params)} parámetros")
        
        if sin_grupo > 0:
            print(f"   ⚠️  Líneas sin grupo: {sin_grupo}")
        
        # Mostrar TODOS los grupos encontrados (ordenados)
        print(f"   📋 Todos los grupos en el archivo:")
        for grupo in sorted(grupos_encontrados.keys(), key=lambda x: int(x) if x.isdigit() else 0):
            print(f"      • Grupo {grupo}: {grupos_encontrados[grupo]} líneas")
    
    except FileNotFoundError:
        print(f"   ❌ Archivo {ARCHIVO_PARAMETROS} no encontrado")
    except Exception as e:
        print(f"   ❌ Error leyendo parámetros: {e}")
        import traceback
        traceback.print_exc()
    
    return nombres_params, caracteristicas_params, marcas_params

def extraer_entidades_unicas(archivo_productos, nombres_params, caracteristicas_params, marcas_params):
    """
    Extrae SOLO los nombres, características y marcas que se usan en productos
    y busca sus descripciones en los diccionarios correspondientes
    """
    nombres_usados = {}
    caracteristicas_usadas = {}
    marcas_usadas = {}
    productos = []
    
    # Contadores para diagnóstico
    ids_no_encontrados = {
        'nombres': set(),
        'caracteristicas': set(),
        'marcas': set()
    }
    
    try:
        # Primero, detectar el delimitador
        with open(archivo_productos, 'r', encoding='utf-8') as f:
            muestra = f.read(2048)
            sniffer = csv.Sniffer()
            delimitador = sniffer.sniff(muestra).delimiter
            print(f"   🔍 Delimitador detectado: '{delimitador}' (ASCII {ord(delimitador)})")
        
        # Ahora leer con el delimitador correcto
        with open(archivo_productos, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=delimitador)
            
            for row in reader:
                # Extraer IDs de nombre, característica y marca
                id_nombre = row.get('iNombre', '').strip()
                id_caracteristica = row.get('iCaracteristica', '').strip()
                id_marca = row.get('iMarca', '').strip()
                
                # Procesar NOMBRE (buscar en grupo 19)
                if id_nombre:
                    if id_nombre not in nombres_usados:
                        if id_nombre in nombres_params:
                            nombres_usados[id_nombre] = nombres_params[id_nombre]
                        else:
                            nombres_usados[id_nombre] = f'Nombre desconocido (ID: {id_nombre})'
                            ids_no_encontrados['nombres'].add(id_nombre)
                
                # Procesar CARACTERÍSTICA (buscar en grupo 20)
                if id_caracteristica:
                    if id_caracteristica not in caracteristicas_usadas:
                        if id_caracteristica in caracteristicas_params:
                            caracteristicas_usadas[id_caracteristica] = caracteristicas_params[id_caracteristica]
                        else:
                            caracteristicas_usadas[id_caracteristica] = f'Característica desconocida (ID: {id_caracteristica})'
                            ids_no_encontrados['caracteristicas'].add(id_caracteristica)
                
                # Procesar MARCA (buscar en grupo 21)
                if id_marca:
                    if id_marca not in marcas_usadas:
                        if id_marca in marcas_params:
                            marcas_usadas[id_marca] = marcas_params[id_marca]
                        else:
                            marcas_usadas[id_marca] = f'Marca desconocida (ID: {id_marca})'
                            ids_no_encontrados['marcas'].add(id_marca)
                
                # Guardar producto completo
                productos.append(row)
        
        # Mostrar IDs no encontrados si los hay (máximo 10 ejemplos)
        if ids_no_encontrados['nombres']:
            ejemplos = sorted(ids_no_encontrados['nombres'])[:10]
            print(f"   ⚠️  IDs de NOMBRES no encontrados (grupo 19): {ejemplos}")
            if len(ids_no_encontrados['nombres']) > 10:
                print(f"      ... y {len(ids_no_encontrados['nombres']) - 10} más")
        
        if ids_no_encontrados['caracteristicas']:
            ejemplos = sorted(ids_no_encontrados['caracteristicas'])[:10]
            print(f"   ⚠️  IDs de CARACTERÍSTICAS no encontrados (grupo 20): {ejemplos}")
            if len(ids_no_encontrados['caracteristicas']) > 10:
                print(f"      ... y {len(ids_no_encontrados['caracteristicas']) - 10} más")
        
        if ids_no_encontrados['marcas']:
            ejemplos = sorted(ids_no_encontrados['marcas'])[:10]
            print(f"   ⚠️  IDs de MARCAS no encontrados (grupo 21): {ejemplos}")
            if len(ids_no_encontrados['marcas']) > 10:
                print(f"      ... y {len(ids_no_encontrados['marcas']) - 10} más")
    
    except Exception as e:
        print(f"   ❌ Error procesando productos: {e}")
        import traceback
        traceback.print_exc()
    
    return nombres_usados, caracteristicas_usadas, marcas_usadas, productos

def escribir_csv_nombres(nombres):
    """Escribe el CSV de nombres de productos con cabecera actualizada"""
    with open(ARCHIVO_NOMBRES, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['iid_nombre', 'vnombre_producto', 'iid_creado_por'])
        
        for id_nombre, nombre in sorted(nombres.items(), key=lambda x: (not x[0].isdigit(), int(x[0]) if x[0].isdigit() else 0, x[0])):
            writer.writerow([id_nombre, nombre, 54])
    
    print(f"   ✅ Creado nombres.csv con {len(nombres)} nombres")

def escribir_csv_caracteristicas(caracteristicas):
    """Escribe el CSV de características con cabecera actualizada"""
    with open(ARCHIVO_CARACTERISTICAS, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['iid_caracteristica', 'vnombre_caracteristica', 'iid_creado_por'])
        
        for id_car, nombre in sorted(caracteristicas.items(), key=lambda x: (not x[0].isdigit(), int(x[0]) if x[0].isdigit() else 0, x[0])):
            writer.writerow([id_car, nombre, 54])
    
    print(f"   ✅ Creado caracteristicas.csv con {len(caracteristicas)} características")

def escribir_csv_marcas(marcas):
    """Escribe el CSV de marcas con cabecera actualizada"""
    with open(ARCHIVO_MARCAS, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['iid_marca', 'vnombre_marca', 'iid_creado_por'])
        
        for id_marca, nombre in sorted(marcas.items(), key=lambda x: (not x[0].isdigit(), int(x[0]) if x[0].isdigit() else 0, x[0])):
            writer.writerow([id_marca, nombre, 54])
    
    print(f"   ✅ Creado marcas.csv con {len(marcas)} marcas")

def escribir_csv_productos(productos):
    """Escribe el CSV de productos normalizados con cabecera actualizada"""
    with open(ARCHIVO_PRODUCTOS_NORM, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Nueva cabecera según especificación
        writer.writerow([
            'codigo_producto',
            'iid_clasificacion',
            'iid_subclasificacion',
            'iid_nombre',
            'iid_caracteristica',
            'iid_marca',
            'modelo',
            'unidad_compra',
            'unidad_consumo',
            'stock',
            'cantidad_minima',
            'fecha_creacion',
            'fecha_ultimo_movimiento',
            'estado',
            'es_de_conteo'
        ])
        
        # Datos
        for prod in productos:
            codigo = prod.get('vCodigo', '').strip()
            clasificacion = prod.get('siClasificacion', '').strip()
            subclasificacion = prod.get('siSubClasificacion', '').strip()
            id_nombre = prod.get('iNombre', '').strip()
            id_caracteristica = prod.get('iCaracteristica', '').strip()
            id_marca = prod.get('iMarca', '').strip()
            modelo = prod.get('vModelo', '').strip()
            unidad_compra = prod.get('siUnidadCompra', '').strip()
            unidad_consumo = prod.get('siUnidadConsumo', '').strip()
            stock = prod.get('dStock', '').strip()
            cantidad_min = prod.get('dCantidadMinima', '').strip()
            fecha_creacion = prod.get('dFechacreacion', '').strip()
            fecha_ultimo_mov = prod.get('dFechaUltimoMovimiento', '').strip()
            estado = prod.get('bEstado', '').strip()
            es_conteo = prod.get('bEsdeConteo', '').strip()
            
            writer.writerow([
                codigo if codigo else None,
                clasificacion if clasificacion else None,
                subclasificacion if subclasificacion else None,
                id_nombre if id_nombre else None,
                id_caracteristica if id_caracteristica else None,
                id_marca if id_marca else None,
                modelo if modelo else None,
                unidad_compra if unidad_compra else None,
                unidad_consumo if unidad_consumo else None,
                stock if stock and stock.upper() != 'NULL' else None,
                cantidad_min if cantidad_min else None,
                fecha_creacion if fecha_creacion else None,
                fecha_ultimo_mov if fecha_ultimo_mov and fecha_ultimo_mov.upper() != 'NULL' else None,
                estado if estado else None,
                es_conteo if es_conteo else None
            ])
    
    print(f"   ✅ Creado productos_normalizados.csv con {len(productos)} productos")

def generar_reporte(nombres, caracteristicas, marcas, productos, nombres_params, caracteristicas_params, marcas_params):
    """Genera un reporte de estadísticas con ejemplos de búsquedas"""
    print("\n" + "="*70)
    print("📊 REPORTE DE NORMALIZACIÓN")
    print("="*70)
    print(f"Total de productos procesados: {len(productos)}")
    print(f"Total de nombres únicos USADOS: {len(nombres)}")
    print(f"Total de características únicas USADAS: {len(caracteristicas)}")
    print(f"Total de marcas únicas USADAS: {len(marcas)}")
    
    print(f"\nTotal de parámetros disponibles por grupo:")
    print(f"   • Grupo 19 (Nombres): {len(nombres_params)}")
    print(f"   • Grupo 20 (Características): {len(caracteristicas_params)}")
    print(f"   • Grupo 21 (Marcas): {len(marcas_params)}")
    
    # Verificación de ejemplos clave
    print("\n🔍 VERIFICACIÓN DE BÚSQUEDAS CLAVE:")
    
    # Buscar "SUERO FISIOLOGICO" (ID 209 en grupo 19)
    if '209' in nombres_params:
        print(f"   ✅ ID 209 (Grupo 19 - Nombres): '{nombres_params['209']}'")
    else:
        print(f"   ❌ ID 209 NO encontrado en Grupo 19 (Nombres)")
    
    # Buscar "ALUMBRE"
    alumbre_encontrado = False
    for id_param, nombre in nombres_params.items():
        if 'ALUMBRE' in nombre.upper():
            print(f"   ✅ ALUMBRE encontrado en Grupo 19: ID {id_param} = '{nombre}'")
            alumbre_encontrado = True
            break
    if not alumbre_encontrado:
        # Buscar en características también
        for id_param, nombre in caracteristicas_params.items():
            if 'ALUMBRE' in nombre.upper():
                print(f"   ✅ ALUMBRE encontrado en Grupo 20: ID {id_param} = '{nombre}'")
                alumbre_encontrado = True
                break
    if not alumbre_encontrado:
        print(f"   ⚠️  'ALUMBRE' no encontrado en ningún grupo")
    
    # Verificar el producto de ejemplo: 1,5,662,01.005.0175,209,674,153
    print("\n🔬 VERIFICACIÓN PRODUCTO EJEMPLO (Código 01.005.0175):")
    producto_ejemplo = None
    for p in productos:
        if p.get('vCodigo', '').strip() == '01.005.0175':
            producto_ejemplo = p
            break
    
    if producto_ejemplo:
        id_nombre = producto_ejemplo.get('iNombre', '').strip()
        id_caracteristica = producto_ejemplo.get('iCaracteristica', '').strip()
        id_marca = producto_ejemplo.get('iMarca', '').strip()
        
        print(f"   Producto encontrado: {producto_ejemplo.get('vCodigo', 'N/A')}")
        if id_nombre:
            nombre_encontrado = nombres_params.get(id_nombre, 'NO ENCONTRADO EN GRUPO 19')
            print(f"   • iNombre = {id_nombre} → '{nombre_encontrado}'")
        if id_caracteristica:
            car_encontrada = caracteristicas_params.get(id_caracteristica, 'NO ENCONTRADO EN GRUPO 20')
            print(f"   • iCaracteristica = {id_caracteristica} → '{car_encontrada}'")
        if id_marca:
            marca_encontrada = marcas_params.get(id_marca, 'NO ENCONTRADO EN GRUPO 21')
            print(f"   • iMarca = {id_marca} → '{marca_encontrada}'")
    else:
        print("   ⚠️  Producto con código 01.005.0175 no encontrado")
    
    # Productos activos/inactivos
    activos = sum(1 for p in productos if p.get('bEstado', '') == '1')
    inactivos = len(productos) - activos
    print(f"\n📈 ESTADÍSTICAS GENERALES:")
    print(f"   Productos activos: {activos}")
    print(f"   Productos inactivos: {inactivos}")
    
    # Productos con/sin características
    con_car = sum(1 for p in productos if p.get('iCaracteristica', '').strip())
    sin_car = len(productos) - con_car
    print(f"   Productos con característica: {con_car}")
    print(f"   Productos sin característica: {sin_car}")
    
    # Productos con/sin marca
    con_marca = sum(1 for p in productos if p.get('iMarca', '').strip())
    sin_marca = len(productos) - con_marca
    print(f"   Productos con marca: {con_marca}")
    print(f"   Productos sin marca: {sin_marca}")
    
    # Top 5 nombres más usados
    uso_nombres = defaultdict(int)
    for p in productos:
        id_nom = p.get('iNombre', '').strip()
        if id_nom:
            uso_nombres[id_nom] += 1
    
    if uso_nombres:
        print("\n🏆 Top 5 nombres más usados:")
        for id_nom, count in sorted(uso_nombres.items(), key=lambda x: x[1], reverse=True)[:5]:
            nombre = nombres.get(id_nom, f'ID {id_nom}')
            print(f"   • {nombre[:60]}: {count} productos")
    
    print("="*70 + "\n")

def main():
    print("\n" + "="*70)
    print("🚀 NORMALIZADOR DE PRODUCTOS - SISTEMA DE INVENTARIO")
    print("="*70 + "\n")
    
    crear_carpeta_salida()
    
    print("📖 Paso 1: Leyendo parámetros generales por grupos...")
    print("           (Grupo 19=Nombres, 20=Características, 21=Marcas)")
    nombres_params, caracteristicas_params, marcas_params = leer_parametros()
    print()
    
    if not nombres_params and not caracteristicas_params and not marcas_params:
        print("❌ No se pudieron cargar los parámetros. Abortando.")
        return
    
    print("🔍 Paso 2: Procesando productos (InvtblProducto.csv)...")
    try:
        nombres, caracteristicas, marcas, productos = extraer_entidades_unicas(
            ARCHIVO_PRODUCTOS, nombres_params, caracteristicas_params, marcas_params
        )
        print(f"   ✅ Procesados {len(productos)} productos")
        print(f"   ✅ Identificados {len(nombres)} nombres únicos")
        print(f"   ✅ Identificadas {len(caracteristicas)} características únicas")
        print(f"   ✅ Identificadas {len(marcas)} marcas únicas")
    except FileNotFoundError:
        print(f"   ❌ Error: No se encontró el archivo '{ARCHIVO_PRODUCTOS}'")
        return
    except Exception as e:
        print(f"   ❌ Error procesando productos: {e}")
        import traceback
        traceback.print_exc()
        return
    print()
    
    print("💾 Paso 3: Generando archivos CSV normalizados...")
    try:
        escribir_csv_nombres(nombres)
        escribir_csv_caracteristicas(caracteristicas)
        escribir_csv_marcas(marcas)
        escribir_csv_productos(productos)
    except Exception as e:
        print(f"   ❌ Error generando archivos: {e}")
        import traceback
        traceback.print_exc()
        return
    print()
    
    generar_reporte(nombres, caracteristicas, marcas, productos, 
                   nombres_params, caracteristicas_params, marcas_params)
    
    print("✨ ¡Proceso completado exitosamente!")
    print(f"📂 Archivos guardados en: {os.path.abspath(CARPETA_SALIDA)}/")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()