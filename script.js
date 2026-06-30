// Folosește import pentru WebR
import { WebR } from 'webr';

console.log('🔥 Script încărcat cu import WebR');

let webrInstance = null;
let isInitialized = false;

// Funcția runRCode - disponibilă global pentru buton
window.runRCode = async function() {
    console.log('▶️ runRCode() apelat');
    
    const resultElement = document.getElementById('result');
    const plotElement = document.getElementById('plotOutput');
    const statusElement = document.getElementById('loadingStatus');
    const inputField = document.getElementById('userInput');
    
    if (!resultElement) {
        console.error('❌ Elementul #result nu există!');
        return;
    }
    
    resultElement.textContent = '⏳ Se procesează...';
    if (statusElement) statusElement.textContent = '⏳ Procesare...';
    
    try {
        if (!webrInstance || !isInitialized) {
            console.log('⏳ WebR nu e gata, inițializez...');
            await initWebR();
            if (!webrInstance || !isInitialized) {
                throw new Error('WebR nu a putut fi inițializat');
            }
        }
        
        // IA DATELE DIN INPUT
        let inputValue = '12,45,63,78,43,15,45';
        if (inputField) {
            inputValue = inputField.value || inputValue;
            console.log('📥 Input:', inputValue);
        }
        
        const numbers = inputValue.split(',')
            .map(x => parseFloat(x.trim()))
            .filter(x => !isNaN(x));
        
        console.log('📊 Numere:', numbers);
        
        if (numbers.length === 0) {
            resultElement.textContent = '⚠️ Introdu cel puțin un număr valid!';
            if (statusElement) statusElement.textContent = '⚠️ Date invalide';
            return;
        }
        
        // COD R - folosește base R (fără pachete externe)
        const rCode = `
            # Datele utilizatorului
            data <- data.frame(
                x = 1:${numbers.length},
                y = c(${numbers.join(',')})
            )
            
            # Calcule statistice
            media <- mean(data$y)
            mediana <- median(data$y)
            suma <- sum(data$y)
            n <- nrow(data)
            sd_val <- sd(data$y)
            
            # Rezultat text
            rezultat <- paste(
                "📊 STATISTICI DESCRIPTIVE\n",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
                "📈 Număr observații: ", n, "\n",
                "📊 Suma: ", round(suma, 2), "\n",
                "📊 Media: ", round(media, 2), "\n",
                "📊 Mediana: ", round(mediana, 2), "\n",
                "📊 Deviație standard: ", round(sd_val, 2), "\n",
                "📊 Minim: ", min(data$y), "\n",
                "📊 Maxim: ", max(data$y), "\n",
                "📊 Range: ", round(max(data$y) - min(data$y), 2), "\n",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            )
            
            # Grafic cu base R
            svg("plot.svg", width = 10, height = 6)
            
            # Setează margini
            par(mar = c(5, 5, 4, 2))
            
            # Creează graficul
            plot(data$x, data$y, 
                 type = "b", 
                 col = "#4A90D9", 
                 pch = 19, 
                 cex = 1.5,
                 lwd = 2,
                 main = "📈 Graficul datelor introduse",
                 xlab = "Index observație",
                 ylab = "Valoare",
                 col.main = "#2c3e50",
                 font.main = 2,
                 cex.main = 1.5,
                 cex.lab = 1.2,
                 cex.axis = 1.1)
            
            # Adaugă linia pentru medie
            abline(h = media, col = "#2ECC71", lty = 2, lwd = 2.5)
            
            # Adaugă legendă
            legend("topright", 
                   legend = c("Date", paste("Media =", round(media, 2))),
                   col = c("#4A90D9", "#2ECC71"),
                   lty = c(1, 2),
                   pch = c(19, NA),
                   lwd = c(2, 2.5),
                   bg = "white",
                   cex = 1.1)
            
            # Adaugă grid
            grid(nx = NULL, ny = NULL, col = "#E8E8E8", lty = 1)
            
            dev.off()
            
            # Citește SVG-ul
            list(
                text = rezultat,
                plot = readLines("plot.svg", warn = FALSE)
            )
        `;
        
        console.log('🔧 Execut cod R...');
        const result = await webrInstance.evalR(rCode);
        console.log('✅ Cod R executat');
        
        const textResult = await result.get('text');
        const plotSVG = await result.get('plot');
        
        console.log('📝 Rezultat primit');
        
        if (resultElement) {
            resultElement.textContent = textResult || 'Nu s-a primit rezultat';
        }
        
        if (plotElement && plotSVG && plotSVG.length > 0) {
            // Curăță SVG-ul de caracterele speciale
            let svgContent = plotSVG.join('\n');
            // Elimină liniile goale și caracterele de control
            svgContent = svgContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
            plotElement.innerHTML = svgContent;
            console.log('✅ Grafic afișat');
        } else if (plotElement) {
            plotElement.innerHTML = '<p style="color:orange;">⚠️ Graficul nu a fost generat</p>';
        }
        
        if (statusElement) {
            statusElement.textContent = '✅ Gata!';
            statusElement.style.color = '#2ECC71';
        }
        console.log('✅ Proces complet');
        
    } catch (error) {
        console.error('❌ Eroare:', error);
        if (resultElement) {
            resultElement.textContent = '❌ Eroare: ' + error.message;
        }
        if (statusElement) {
            statusElement.textContent = '❌ Eroare: ' + error.message;
            statusElement.style.color = '#e74c3c';
        }
    }
};

// Funcția de inițializare
async function initWebR() {
    console.log('🔄 Inițializez WebR...');
    try {
        const status = document.getElementById('loadingStatus');
        if (status) {
            status.textContent = '⏳ Inițializare WebR... (10-20 secunde)';
            status.style.color = '#666';
        }
        
        // Creează instanța WebR
        webrInstance = new WebR();
        await webrInstance.init();
        console.log('✅ WebR inițializat');
        
        isInitialized = true;
        
        if (status) {
            status.textContent = '✅ Gata! Apasă "Rulează R" pentru a începe';
            status.style.color = '#2ECC71';
        }
        
        console.log('✅ Totul e gata!');
        
        // Rulează automat după 2 secunde
        setTimeout(() => {
            console.log('🔄 Rulează exemplul automat...');
            window.runRCode();
        }, 2000);
        
        return webrInstance;
    } catch (error) {
        console.error('❌ Eroare inițializare:', error);
        const status = document.getElementById('loadingStatus');
        if (status) {
            status.textContent = '❌ Eroare: ' + error.message;
            status.style.color = '#E74C3C';
        }
        return null;
    }
}

// Pornește la încărcare
console.log('🚀 Inițializare aplicație...');

// Adaugă event listener pentru buton
const button = document.getElementById('runButton');
if (button) {
    button.addEventListener('click', window.runRCode);
    console.log('✅ Buton configurat');
} else {
    console.warn('⚠️ Butonul #runButton nu există');
}

// Inițializează WebR
setTimeout(() => {
    initWebR();
}, 1000);

console.log('✅ Script încărcat complet');
