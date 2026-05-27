import os
import time
import random
import shutil
from colorama import Fore, init

init(autoreset=True)

os.system("clear")
os.system("toilet -f big 'KALI LINUX'")

banner = r'''
██╗  ██╗ █████╗ ██╗     ██╗    ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗
██║ ██╔╝██╔══██╗██║     ██║    ██║     ██║████╗  ██║██║   ██║╚██╗██╔╝
█████╔╝ ███████║██║     ██║    ██║     ██║██╔██╗ ██║██║   ██║ ╚███╔╝
██╔═██╗ ██╔══██║██║     ██║    ██║     ██║██║╚██╗██║██║   ██║ ██╔██╗
██║  ██╗██║  ██║███████╗██║    ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝
'''

def show_banner(text):
    try:
        width = shutil.get_terminal_size().columns
        print(Fore.RED + "\n".join(line.center(width) for line in text.split("\n")))
    except:
        print(Fore.RED + text)

show_banner(banner)

os.system("clear")

print(Fore.RED + "\n==============================")
print(Fore.RED + "         KALI LINUX")
print(Fore.RED + "==============================")

# ─────────────────────────────
# PROCESOS (SIN HORA)
# ─────────────────────────────

procesos = [
    "Iniciando módulo de ciberseguridad",
    "Conectando nodo remoto",
    "Verificando acceso seguro",
    "Accediendo a base de datos remota",
    "Analizando registros del sistema",
    "Escaneando puertos vulnerables",
    "Iniciando monitoreo en tiempo real",
    "Detectando conexiones activas",
    "Analizando paquetes TCP/IP",
    "Inspeccionando tráfico sospechoso",
    "Buscando vulnerabilidades críticas",
    "Sincronizando telemetría del nodo",
    "Verificando firewall principal",
    "Cargando sistema..."
]

for p in procesos:
    print(Fore.GREEN + f"{p} ... ON")
    time.sleep(0.15)

# ─────────────────────────────
# LOADER TIPO BATERÍA 🔋 (AÑADIDO SIN BORRAR NADA)
# ─────────────────────────────

print(Fore.YELLOW + "\n============= CARGANDO SISTEMA =============\n")

bar_length = 30

for i in range(0, 101):
    filled = int(bar_length * i / 100)
    bar = "█" * filled + "-" * (bar_length - filled)

    print(Fore.GREEN + f"\r🔋 [{bar}] {i}%", end="")
    time.sleep(0.04)

print(Fore.GREEN + "\n\n[✓] SISTEMA INICIADO\n")

# ─────────────────────────────
# PERFIL (INTACTO)
# ─────────────────────────────

print(Fore.YELLOW + "\n============= PERFIL DEL SUJET@=============\n")

datos = [
    ("Nombre", "Daniel Enrique"),
    ("Apellidos", "Elio Ocampo"),
    ("Edad", "25 años"),
    ("Año de nacimiento", "2001"),
    ("Padre", "Marco Elio Rodríguez"),
    ("Madre", "Sara Ocampo Lencina"),
    ("Sexo", "Hombre"),
    ("Estado", "Soltero"),
    ("Fecha Nacimiento", "29 Junio 2001"),
    ("DNI", "40587619"),
    ("Pais", "Peru"),
    ("Region", "Lima Metropolitana"),
    ("Ciudad", "Lima"),
    ("Distrito", "Ate"),
    ("Ubicacion", "AV Santa Clara / C:09"),
    ("Proveedor", "INTEGRATEL PERU S.A.A."),
    ("IP Principal", "181.65.214.92"),
    ("IP Secundaria", "192.168.18.24"),
    ("Operador", "Movistar"),
    ("Linea Activa", "+51 975922748"),
    ("Linea Secundaria", "+51 916 483 229"),
    ("Pago Pendiente", "S/55"),
    ("Linea Adicional", "+51 978 224 610"),
    ("Pago Adicional", "S/37"),
    ("Linea Bitel", "+51 930 551 742"),
    ("Trabajo", "Asistente Tecnico Redes"),
    ("Registro 2023", "Orden Publico"),
    ("Registro 2025", "Incidente Vehicular"),
    ("Estado Legal", "Sin procesos activos"),
    ("Educacion", "Secundaria completa - Colegio Trilce Los Olivos"),
    ("Moto Taxi", "4582-AB"),
    ("Moto Lineal", "9016-XT"),
    ("Celular 1", "Samsung Galaxy A15"),
    ("Celular 2", "Redmi Note 13"),
    ("Celular 3", "Realme C67"),
    ("Laptop", "MacBook Air M4"),
    ("Direccion MAC", "A4:9F:34:8C:12:7D"),
    ("CPU", "Apple Silicon M4"),
    ("GPU", "10-Core GPU"),
    ("RAM", "16GB Unified"),
    ("SSD", "512GB SSD"),
    ("Pantalla", "13.6 Retina"),
    ("Resolucion", "2560x1664"),
    ("Sistema", "macOS Sequoia"),
    ("Kernel", "Darwin 24.2.0"),
    ("Estado Dispositivo", "ONLINE")
]

for k, v in datos:
    print(Fore.CYAN + f"{k:<20} : {v}")
    time.sleep(0.06)

# ─────────────────────────────
# ESTADO DE RED (INTACTO)
# ─────────────────────────────

print(Fore.MAGENTA + "\n============= ESTADO DE RED =============\n")

network = [
    "CAPA_TLS               : ACTIVA",
    "NODO_REMOTO            : CONECTADO",
    "FIREWALL               : HABILITADO",
    "MONITOREO_RED          : ACTIVO",
    "LATENCIA               : 18ms",
    "PERDIDA_PAQUETES       : 0.2%",
    "PUERTO_443             : ABIERTO",
    "PUERTO_80              : ABIERTO",
    "PUERTO_22              : FILTRADO",
    "DISPOSITIVO            : EN LINEA",
    "BASE_DATOS             : CONECTADA",
    "TRAFICO_RED            : ESTABLE",
    "CIFRADO_SSL_TLS        : VERIFICADO",
    "SESION_SEGURA          : ESTABLECIDA",
    "MONITOREO              : EN TIEMPO REAL"
]

for n in network:
    print(Fore.GREEN + n)
    time.sleep(0.08)

# ─────────────────────────────
# TELEMETRÍA
# ─────────────────────────────

print(Fore.RED + "\n============= TELEMETRÍA EN VIVO =============\n")

for i in range(25):
    up = random.randint(100, 900)
    down = random.randint(300, 1200)
    lat = random.randint(10, 40)

    print(Fore.GREEN + f"📡 NODO-{random.randint(1000,9999)} SUBIDA:{up}KB/s BAJADA:{down}KB/s LATENCIA:{lat}ms ON")
    time.sleep(0.05)

print(Fore.GREEN + "\n[✓] SESIÓN FINALIZADA")

