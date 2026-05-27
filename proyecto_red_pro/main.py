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
# PROCESOS
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
    "Cargando módulo forense",
    "Analizando actividad del dispositivo",
    "Comprobando cifrado SSL/TLS",
    "Escaneando procesos del sistema",
    "Verificando integridad del kernel",
    "Estableciendo túnel seguro",
    "Inicializando consola de monitoreo",
    "Analizando registros del sistema",
    "Motor de ciberseguridad iniciado"
]

for p in procesos:
    hora = time.strftime("%H:%M:%S")
    print(Fore.GREEN + f"[{hora}] {p} ... ON")
    time.sleep(0.12)

# ─────────────────────────────
# PERFIL
# ─────────────────────────────

print(Fore.YELLOW + "\n============= PERFIL DEL USUARIO =============\n")

datos = [
    ("Nombre", "Daniel Enrique"),
    ("Apellidos", "Elio Ocampo"),
    ("Edad", "25 años"),
    ("Año de nacimiento", "2001"),
    ("Padre", "Marco Elio Rodríguez"),
    ("Madre", "Sara Ocampo Lencina"),
    ("Sexo", "Hombre"),
    ("Estado civil", "Soltero"),
    ("Fecha de nacimiento", "29 de junio de 2001"),
    ("DNI", "40587619"),
    ("País", "Perú"),
    ("Región", "Lima Metropolitana"),
    ("Ciudad", "Lima"),
    ("Distrito", "Ate"),
    ("Ubicación", "Av. Santa Clara C-09"),
    ("Proveedor", "INTEGRATEL PERÚ S.A.A."),
    ("IP principal", "181.65.214.92"),
    ("IP secundaria", "192.168.18.24"),
    ("Operador", "Movistar"),
    ("Línea activa", "+51 975922748"),
    ("Línea secundaria", "+51 916 483 229"),
    ("Pago pendiente", "S/55"),
    ("Línea adicional", "+51 978 224 610"),
    ("Pago adicional", "S/37"),
    ("Línea Bitel", "+51 930 551 742"),
    ("Trabajo", "Asistente técnico en redes"),
    ("Registro 2023", "Orden público"),
    ("Registro 2025", "Incidente vehicular"),
    ("Estado legal", "Sin procesos activos"),
    ("Educación", "Secundaria completa - Colegio Trilce Los Olivos"),
    ("Moto taxi", "4582-AB"),
    ("Moto lineal", "9016-XT"),
    ("Celular 1", "Samsung Galaxy A15"),
    ("Celular 2", "Redmi Note 13"),
    ("Celular 3", "Realme C67"),
    ("Laptop", "MacBook Air M4"),
    ("Dirección MAC", "A4:9F:34:8C:12:7D"),
    ("CPU", "Apple Silicon M4"),
    ("GPU", "10-core GPU"),
    ("RAM", "16 GB unificada"),
    ("SSD", "512 GB"),
    ("Pantalla", "13.6 Retina"),
    ("Resolución", "2560x1664"),
    ("Sistema", "macOS Sequoia"),
    ("Kernel", "Darwin 24.2.0"),
    ("Estado del dispositivo", "ONLINE")
]

for k, v in datos:
    print(Fore.CYAN + f"{k:<22} : {v}")
    time.sleep(0.05)

# ─────────────────────────────
# RED DINÁMICA
# ─────────────────────────────

print(Fore.MAGENTA + "\n============= ESTADO DE RED =============\n")

def generar_red():
    return [
        f"CAPA TLS               : {'ACTIVA' if random.random() > 0.1 else 'INESTABLE'}",
        f"NODO REMOTO            : {'CONECTADO' if random.random() > 0.1 else 'RECONEXIÓN'}",
        f"FIREWALL               : {'HABILITADO' if random.random() > 0.1 else 'REVISIÓN'}",
        f"MONITOREO DE RED       : ACTIVO",
        f"LATENCIA               : {random.randint(5, 80)} ms",
        f"PÉRDIDA DE PAQUETES    : {random.randint(0, 5)}%",
        f"PUERTO 443             : {'ABIERTO' if random.random() > 0.2 else 'FILTRADO'}",
        f"PUERTO 80              : {'ABIERTO' if random.random() > 0.2 else 'FILTRADO'}",
        f"PUERTO 22              : {'FILTRADO' if random.random() > 0.5 else 'ABIERTO'}",
        f"DISPOSITIVO            : EN LÍNEA",
        f"BASE DE DATOS          : {'CONECTADA' if random.random() > 0.1 else 'ERROR'}",
        f"TRÁFICO DE RED         : {'ESTABLE' if random.random() > 0.2 else 'ALTO'}",
        f"CIFRADO SSL/TLS        : VERIFICADO",
        f"SESIÓN SEGURA          : {'ESTABLECIDA' if random.random() > 0.1 else 'INSEGURA'}",
        f"SERVICIOS REMOTOS      : ACTIVOS",
        f"ANÁLISIS FORENSE       : COMPLETADO",
        f"ESCANEO DE SEGURIDAD   : FINALIZADO"
    ]

network = generar_red()

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

