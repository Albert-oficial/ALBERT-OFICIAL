import os
import time
import random
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

print(Fore.RED + banner)

cmd = input(Fore.GREEN + "\nroot@kali-node:~# ")

if cmd == "Kali/*Node,8844linux":

    os.system("clear")

    print(Fore.RED + "\n==============================")
    print(Fore.RED + "         KALI LINUX")
    print(Fore.RED + "==============================")

    procesos = [
        "Initializing encrypted node",
        "Parsing remote metadata",
        "Analyzing endpoint packets",
        "Connecting secure transport",
        "Building telemetry profile",
        "Scanning infrastructure",
        "Loading realtime monitor",
        "Synchronizing relay node",
        "Accessing distributed cache",
        "Resolving active session"
    ]

    for p in procesos:
        hora = time.strftime("%H:%M:%S")
        print(Fore.GREEN + f"[{hora}] [+] {p} ... OK")
        time.sleep(0.30)

    print(Fore.YELLOW + "\n============= PROFILE DATA =============\n")

    datos = [

        ("Nombre", "Daniel Enrique"),
        ("Apellidos", "Elio Ocampo"),

        ("Padre", "Marco Elio Rodriguez"),
        ("Madre", "Sara Ocampo Lencina"),

        ("Sexo", "Hombre"),
        ("Estado", "Soltero"),

        ("Fecha Nacimiento", "29 Junio 2001"),

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

        ("Colegio", "Colegio Trilce Los Olivos"),

        ("Moto Taxi", "4582-AB"),
        ("Moto Lineal", "9016-XT"),

        ("Celular 1", "Samsung Galaxy A15"),
        ("Celular 2", "Redmi Note 13"),
        ("Celular 3", "Realme C67"),

        ("Laptop", "MacBook Air M4"),
        ("MAC", "A4:9F:34:8C:12:7D"),
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
        print(Fore.CYAN + f"[DATA] {k:<20} : {v}")
        time.sleep(0.09)

    print(Fore.MAGENTA + "\n============= NETWORK STATUS =============\n")

    network = [
        "TLS_LAYER         : ACTIVE",
        "REMOTE_NODE       : CONNECTED",
        "FIREWALL_STATUS   : ENABLED",
        "TRAFFIC_MONITOR   : ACTIVE",
        "LATENCY           : 18ms",
        "PACKET_LOSS       : 0.2%",
        "PORT_443          : OPEN",
        "PORT_80           : OPEN",
        "PORT_22           : FILTERED",
        "DEVICE_STATUS     : ONLINE"
    ]

    for n in network:
        print(Fore.GREEN + n)
        time.sleep(0.12)

    print(Fore.RED + "\n============= LIVE TELEMETRY =============\n")

    for i in range(20):

        up = random.randint(100,900)
        down = random.randint(300,1200)
        lat = random.randint(10,40)

        print(
            Fore.YELLOW +
            f"[NODE-{random.randint(1000,9999)}] "
            f"UP:{up}KB/s "
            f"DOWN:{down}KB/s "
            f"LAT:{lat}ms"
        )

        time.sleep(0.10)

    print(Fore.GREEN + "\n[✓] SESSION COMPLETE")

else:
    print(Fore.RED + "\n[!] INVALID COMMAND")
