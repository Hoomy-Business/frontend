// Script pour obtenir l'IP locale
const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const ip = getLocalIP();
console.log('\n🌐 IP Locale détectée:', ip);
console.log('📱 Frontend: http://' + ip + ':5000');
console.log('🔧 Backend:  http://' + ip + ':3000');
console.log('');

