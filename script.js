console.log('🚀 Script pornit!');

// Import WebR
import { WebR } from 'webr';

console.log('✅ WebR importat');

let webr = null;

// Funcția principală
async function runR() {
    console.log('🔄 runR() apelat');
    
    const statusEl = document.getElementById('status');
    const resultEl = document.getElementById('result');
    const plotEl = document.getElementById('plotOutput');
    const inputEl = document.getElementById('userInput');
    
    try {
        // 1. Inițializează WebR
        if (!webr) {
            statusEl.textContent = '⏳ Inițializare WebR... (10-20 sec)';
            console.log('🔄 Creez instanță WebR...');
            
            webr = new WebR();
            await webr.init();
            
            console.log('✅ WebR inițializat!');
            statusEl.textContent = '✅ WebR gata!';
        }
        
        // 2. Ia datele
        const input = inputEl.value || '1,2,3,4,5';
        console.log('📥 Input:', input);
        
        const numbers = input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
        console.log('📊 Numere:', numbers);
        
        if (numbers.length === 0) {
            resultEl.textContent = '⚠️ Introdu numere valide!';
            return;
        }
        
        // 3. Cod R simplu
        statusEl.textContent = '⏳ Rulează cod R...';
        resultEl.textContent = '⏳ Se procesează...';
        
        const rCode = `
            # Date
            x <- c(${numbers.join(',')})
            n <- length(x)
            medie <- mean(x)
            suma <- sum(x)
            
            # Rezultat
            rezultat <- paste(
                "Număr observații:", n, "\n",
                "Suma:", suma, "\n",
                "Media:", round(medie, 2), "\n",
                "Min:", min(x), "\n",
                "Max:", max(x)
            )
            
            # Grafic
            svg("plot.svg", width = 8, height = 5)
            plot(1:n, x, 
                 type = "b", 
                 col = "blue", 
                 pch = 19,
                 main = "Grafic",
                 xlab = "Index",
                 ylab = "Valoare")
            abline(h = medie, col = "red", lty = 2)
            dev.off()
            
            list(
                text = rezultat,
                plot = readLines("plot.svg", warn = FALSE)
            )
        `;
        
        console.log('🔧 Execut cod R...');
        const result = await webr.evalR(rCode);
        console.log('✅ Cod R executat');
        
        // 4. Extrage rezultatele
        const text = await result.get('text');
        const plot = await result.get('plot');
        
        console.log('📝 Text primit');
        console.log('📊 Plot lungime:', plot ? plot.length : 0);
        
        // 5. Afișează
        resultEl.textContent = text;
        
        if (plot && plot.length > 0) {
            plotEl.innerHTML = plot.join('\n');
            console.log('✅ Grafic afișat');
        } else {
            plotEl.innerHTML = '<p style="color:orange;">⚠️ Graficul nu a fost generat</p>';
        }
        
        statusEl.textContent = '✅ Gata!';
        console.log('✅ Proces complet!');
        
    } catch (error) {
        console.error('❌ EROARE:', error);
        statusEl.textContent = '❌ Eroare: ' + error.message;
        resultEl.textContent = '❌ Eroare: ' + error.message;
    }
}

// Configurare buton
document.getElementById('runButton').addEventListener('click', runR);

// Rulează automat la încărcare
console.log('🔄 Rulez automat...');
setTimeout(runR, 2000);

console.log('✅ Script gata!');
