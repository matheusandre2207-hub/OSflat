// ELEMENTOS DO DOM
const swipeTrigger = document.getElementById('swipe-trigger');
const appDrawer = document.getElementById('app-drawer');
const overlayBlur = document.getElementById('overlay-blur');
const homeScreen = document.getElementById('home-screen');
const drawerItems = document.querySelectorAll('.drawer-item');

const triggerNotifications = document.getElementById('trigger-notifications');
const triggerUtilities = document.getElementById('trigger-utilities');
const panelNotifications = document.getElementById('panel-notifications');
const panelUtilities = document.getElementById('panel-utilities');
const btnWifi = document.getElementById('btn-wifi');
const btnBluetooth = document.getElementById('btn-bluetooth');
const brightnessSlider = document.getElementById('brightness-slider');
const screenContainer = document.getElementById('screen-container');

// ELEMENTOS DA NOVA PÍLULA DE STATUS
const dot1 = document.getElementById('dot1');
const dot2 = document.getElementById('dot2');
const dot3 = document.getElementById('dot3');

// CONTROLE DA GAVETA LATERAL
function openDrawer() {
    appDrawer.classList.remove('closed');
    overlayBlur.classList.remove('hidden');
}

// FECHAMENTO DA GAVETA LATERAL
function closeDrawer() {
    appDrawer.classList.add('closed');
    if (panelNotifications.classList.contains('closed') && panelUtilities.classList.contains('closed')) {
        overlayBlur.classList.add('hidden');
    }
}

swipeTrigger.addEventListener('click', openDrawer);
overlayBlur.addEventListener('click', () => {
    closeDrawer();
    panelNotifications.classList.add('closed');
    panelUtilities.classList.add('closed');
});

// EVENTOS DOS APPS
drawerItems.forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.getAttribute('data-app');
        alert(`Abrindo: ${appName.toUpperCase()}`);
        closeDrawer();
    });
});

// ABERTURA DOS PAINÉIS SUPERIORES
triggerNotifications.addEventListener('click', (e) => {
    e.stopPropagation();
    panelNotifications.classList.toggle('closed');
    panelUtilities.classList.add('closed');
    if (!panelNotifications.classList.contains('closed')) overlayBlur.classList.remove('hidden');
    else if (appDrawer.classList.contains('closed')) overlayBlur.classList.add('hidden');
});

triggerUtilities.addEventListener('click', (e) => {
    e.stopPropagation();
    panelUtilities.classList.toggle('closed');
    panelNotifications.classList.add('closed');
    if (!panelUtilities.classList.contains('closed')) overlayBlur.classList.remove('hidden');
    else if (appDrawer.classList.contains('closed')) overlayBlur.classList.add('hidden');
});

document.addEventListener('click', () => {
    panelNotifications.classList.add('closed');
    panelUtilities.classList.add('closed');
    if (appDrawer.classList.contains('closed')) overlayBlur.classList.add('hidden');
});

panelNotifications.addEventListener('click', e => e.stopPropagation());
panelUtilities.addEventListener('click', e => e.stopPropagation());

btnWifi.addEventListener('click', () => btnWifi.classList.toggle('active'));
btnBluetooth.addEventListener('click', () => btnBluetooth.classList.toggle('active'));

brightnessSlider.addEventListener('input', (e) => {
    screenContainer.style.filter = `brightness(${e.target.value}%)`;
});

// RELÓGIO E DATA REAIS DO CELULAR
function updateSystemTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    document.getElementById('status-time').textContent = timeString;
    document.getElementById('drawer-status-time').textContent = timeString;

    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateString = now.toLocaleDateString('pt-BR', options);
    document.getElementById('drawer-current-date').textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
}
setInterval(updateSystemTime, 1000);
updateSystemTime();

// LÓGICA COMPLETA DE RENDERIZAÇÃO DOS TRÊS PONTINHOS DA BATERIA (...)
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        function updateBatteryStatus() {
            const level = Math.round(battery.level * 100);
            const isCharging = battery.charging;

            // Limpa todas as classes de animação e estados anteriores
            [dot1, dot2, dot3].forEach(dot => {
                dot.className = 'dot'; 
            });

            // 1. CENÁRIO DISPOSITIVO CARREGANDO
            if (isCharging) {
                if (level < 33) {
                    // Abaixo de 30% (conforme solicitado): O último ponto visível (neste caso o primeiro) pisca lento
                    dot1.classList.add('blink-slow');
                } else if (level >= 33 && level < 66) {
                    dot1.classList.add('charged');
                    dot2.classList.add('blink-charge');
                } else if (level >= 66 && level < 100) {
                    dot1.classList.add('charged');
                    dot2.classList.add('charged');
                    dot3.classList.add('blink-charge');
                } else {
                    // 100% carregado: Para tudo aceso firme
                    dot1.classList.add('charged');
                    dot2.classList.add('charged');
                    dot3.classList.add('charged');
                }
            } 
            // 2. CENÁRIO DISPOSITIVO DESCARREGANDO
            else {
                if (level <= 20) {
                    // Abaixo de 20%: Apenas o último ponto ativo e piscando rápido continuamente
                    dot1.classList.add('blink-fast');
                } else if (level > 20 && level <= 33) {
                    dot1.classList.add('charged');
                } else if (level > 33 && level <= 66) {
                    dot1.classList.add('charged');
                    dot2.classList.add('charged'); // O terceiro ponto fica opacado nativamente
                } else {
                    // Acima de 66%: Todos os 3 pontos visíveis e acesos fixos
                    dot1.classList.add('charged');
                    dot2.classList.add('charged');
                    dot3.classList.add('charged');
                }
            }
        }

        updateBatteryStatus();
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
    });
}

// CAPTURA DE GESTOS DO RETROCESSO DO SMARTPHONE (Gesto de voltar)
function lockHistory() {
    window.history.pushState({ systemActive: true }, '');
}
lockHistory();

window.addEventListener('popstate', () => {
    if (!appDrawer.classList.contains('closed')) closeDrawer();
    else if (!panelNotifications.classList.contains('closed') || !panelUtilities.classList.contains('closed')) {
        panelNotifications.classList.add('closed');
        panelUtilities.classList.add('closed');
        overlayBlur.classList.add('hidden');
    }
    lockHistory();
});

// SUPORTE A SWIPE TOUCH LATERAL
let touchStartX = 0;
homeScreen.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
homeScreen.addEventListener('touchend', e => {
    let touchEndX = e.changedTouches[0].clientX;
    if (touchStartX < 50 && (touchEndX - touchStartX) > 60) openDrawer();
});

// FORÇAR TELA CHEIA COMPLETA AO PRIMEIRO TOQUE
document.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
}, { once: true });