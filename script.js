 // Import WebR folosind metoda oficială
import { WebR } from 'webr';

console.log('🚀 Pornire aplicație...');

let webRInstance = null;
let isInitialized = false;

// Funcția de inițializare
async function initWebR() {
    console.log('🔄 Inițializez WebR...');
    try {
        const status = document.getElementById('loadingStatus');
        status.textContent = '⏳ Inițializare WebR... (10-20 secunde)';
        status.style.color = '#666';
        
        // Creează instanța WebR
        console.log('🔄 Creez instanță WebR...');
        webRInstance = new WebR();
        await webRInstance.init();
        console.log('✅ WebR inițializat');
        
        isInitialized = true;
        
        status.textContent = '✅ WebR gata! Apasă butonul.';
        status.style.color = '#2ECC71';
        
        // Rulează automat după 2 secunde
        setTimeout(() => {
            console.log('🔄 Rulează automat...');
            runRCode();
        }, 2000);
        
        return webRInstance;
    } catch (error) {
        console.error('❌ Eroare inițializare:', error);
        document.getElementById('loadingStatus').innerHTML = 
            `<span style="color:red;">❌ Eroare: ${error.message}</span>`;
        return null;
    }
}

// Funcția principală
async function runRCode() {
    console.log('▶️ runRCode() apelat');
    
    const resultDiv = document.getElementById('result');
    const plotDiv = document.getElementById('plotOutput');
    const statusDiv = document.getElementById('loadingStatus');
    const inputField = document.getElementById('userInput');
    
    resultDiv.textContent = '⏳ Procesare...';
    
    try {
        if (!webRInstance || !isInitialized) {
            console.log('⏳ WebR nu e gata, inițializez...');
            await initWebR();
            if (!webRInstance || !isInitialized) {
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
            resultDiv.textContent = '⚠️ Introdu cel puțin un număr valid!';
            return;
        }
        
        // COD R - simplu, fără pachete externe
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
            par(mar = c(5, 5, 4, 2))
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
            abline(h = media, col = "#2ECC71", lty = 2, lwd = 2.5)
            legend("topright", 
                   legend = c("Date", paste("Media =", round(media, 2))),
                   col = c("#4A90D9", "#2ECC71"),
                   lty = c(1, 2),
                   pch = c(19, NA),
                   lwd = c(2, 2.5),
                   bg = "white",
                   cex = 1.1)
            grid(nx = NULL, ny = NULL, col = "#E8E8E8", lty = 1)
            dev.off()
            
            list(
                text = rezultat,
                plot = readLines("plot.svg", warn = FALSE)
            )
        `;
        
        console.log('🔧 Execut cod R...');
        const result = await webRInstance.evalR(rCode);
        console.log('✅ Cod R executat');
        
        const textResult = await result.get('text');
        const plotSVG = await result.get('plot');
        
        console.log('📝 Rezultat primit');
        
        resultDiv.textContent = textResult || 'Nu s-a primit rezultat';
        
        if (plotSVG && plotSVG.length > 0) {
            let svgContent = plotSVG.join('\n');
            svgContent = svgContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
            plotDiv.innerHTML = svgContent;
            console.log('✅ Grafic afișat');
        } else {
            plotDiv.innerHTML = '<p style="color:orange;">⚠️ Graficul nu a fost generat</p>';
        }
        
        statusDiv.textContent = '✅ Gata!';
        console.log('✅ Proces complet');
        
    } catch (error) {
        console.error('❌ Eroare:', error);
        resultDiv.textContent = '❌ Eroare: ' + error.message;
        statusDiv.innerHTML = `<span style="color:red;">❌ Eroare: ${error.message}</span>`;
    }
}

// Expune funcția global pentru buton
window.runRCode = runRCode;

// Buton
document.getElementById('runButton').addEventListener('click', () => {
    console.log('🖱️ Buton apăsat');
    runRCode();
});

// Pornește inițializarea
setTimeout(() => {
    initWebR();
}, 500);

console.log('✅ Script încărcat complet');
