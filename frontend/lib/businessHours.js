// Cria o formatador apenas uma vez na memória para não sobrecarregar a CPU
const options = { timeZone: 'America/Sao_Paulo', hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric' };
const formatter = new Intl.DateTimeFormat('en-US', options);

export function calculateBusinessSeconds(startDate, endDate) {
    let current = new Date(startDate.getTime());
    let businessSeconds = 0;
    
    // Safety check: se a data final for menor que a inicial, ou se a diferença for gigantesca (prevenção de loop infinito)
    if (endDate <= startDate) return 0;
    
    // Max iteration cap: se a diferença for maior que 30 dias (30 * 24 * 60 minutos), nós evitamos iterações longas demais
    const MAX_DAYS = 30;
    if ((endDate - startDate) > MAX_DAYS * 24 * 60 * 60 * 1000) {
        // Fallback simples se passar de 30 dias na espera
        return Math.round((endDate - startDate) / 1000);
    }

    // Iteramos minuto a minuto
    while (current < endDate) {
        // Encontra quantos segundos podemos adicionar neste passo (até 60 ou o resto se for menor)
        const nextMinute = new Date(current.getTime() + 60000);
        const stepEnd = nextMinute > endDate ? endDate : nextMinute;
        const stepSeconds = (stepEnd.getTime() - current.getTime()) / 1000;

        const parts = formatter.formatToParts(current);
        
        let weekday, hour, minute;
        for (const part of parts) {
            if (part.type === 'weekday') weekday = part.value;
            if (part.type === 'hour') hour = parseInt(part.value, 10);
            if (part.type === 'minute') minute = parseInt(part.value, 10);
        }

        // Verifica dias da semana
        const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday);
        
        // Converte o horário atual em minutos desde a meia-noite
        const timeInMinutes = hour * 60 + minute;
        
        // 07:30 às 12:30 (12:30 não é mais considerado dentro da janela)
        const isMorning = timeInMinutes >= (7 * 60 + 30) && timeInMinutes < (12 * 60 + 30);
        
        // 13:30 às 17:18 (17:18 não é mais considerado dentro da janela)
        const isAfternoon = timeInMinutes >= (13 * 60 + 30) && timeInMinutes < (17 * 60 + 18);

        // Se está dentro das condições, soma os segundos deste minuto
        if (isWeekday && (isMorning || isAfternoon)) {
            businessSeconds += stepSeconds;
        }

        current = nextMinute;
    }
    
    return Math.round(businessSeconds);
}
