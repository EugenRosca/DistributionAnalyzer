console.log('🔥 Script încărcat');

// Verifică dacă WebR este disponibil
if (typeof WebR === 'undefined') {
    console.error('❌ WebR nu este definit! Verifică încărcarea CDN-ului.');
    document.getElementById('loadingStatus').textContent = '❌ Eroare: WebR nu s-a încărcat. Verifică conexiunea.';
    document.getElementById('loadingStatus').style.color = '#e74c3c';
}

let webrInstance = null;
let isInitialized = false;

// Funcția runRCode disponibilă GLOBAL
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
        if (typeof WebR === 'undefined') {
            throw new Error('WebR nu este disponibil. Verifică conexiunea la internet.');
        }
        
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
        
        // COD R SIMPLIFICAT (FĂRĂ PACHETE EXTERNE INITIAL)
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
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            )
            
            # Grafic simplu (fără ggplot2, folosind base R)
            svg("plot.svg", width = 10, height = 6)
            plot(data$x, data$y, 
                 type = "b", 
                 col = "blue", 
                 pch = 19, 
                 cex = 1.5,
                 main = "Graficul datelor introduse",
                 xlab = "Index observație",
                 ylab = "Valoare",
                 col.main = "#2c3e50",
                 font.main = 2)
            abline(h = media, col = "green", lty = 2, lwd = 2)
            legend("topright", 
                   legend = c("Date", paste("Media =", round(media, 2))),
                   col = c("blue", "green"),
                   lty = c(1, 2),
                   pch = c(19, NA),
                   lwd = c(1, 2))
            dev.off()
            
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
            plotElement.innerHTML = plotSVG.join('\n');
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
        
        // Verifică dacă WebR există
        if (typeof WebR === 'undefined') {
            throw new Error('WebR nu este disponibil. Verifică conexiunea la internet și reîmprospătează pagina.');
        }
        
        webrInstance = new WebR();
        await webrInstance.init();
        console.log('✅ WebR inițializat');
        
        if (status) {
            status.textContent = '⏳ Se pregătește...';
        }
        
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
window.addEventListener('load', function() {
    console.log('🚀 Pagina încărcată');
    
    // Adaugă event listener pentru buton
    const button = document.getElementById('runButton');
    if (button) {
        button.addEventListener('click', window.runRCode);
        console.log('✅ Buton configurat');
    } else {
        console.warn('⚠️ Butonul #runButton nu există');
    }
    
    // Verifică dacă WebR e definit
    if (typeof WebR === 'undefined') {
        console.error('❌ WebR NU este definit!');
        const status = document.getElementById('loadingStatus');
        if (status) {
            status.textContent = '❌ Eroare: WebR nu s-a încărcat. Verifică conexiunea la internet.';
            status.style.color = '#e74c3c';
        }
        return;
    }
    
    // Inițializează WebR
    setTimeout(() => {
        initWebR();
    }, 1000);
});

console.log('✅ Script încărcat complet');
console.log('📌 WebR disponibil:', typeof WebR !== 'undefined' ? '✅ Da' : '❌ Nu');
