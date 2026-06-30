console.log('🔥 SCRIPT ÎNCĂRCAT - versiunea corectată');

let webrInstance = null;
let isInitialized = false;

// Funcția runRCode disponibilă GLOBAL
window.runRCode = async function() {
    console.log('▶️ runRCode() apelat de buton');
    
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
        // Verifică dacă WebR e inițializat
        if (!webrInstance || !isInitialized) {
            console.log('⏳ WebR nu e gata, inițializez...');
            await initWebR();
            if (!webrInstance || !isInitialized) {
                resultElement.textContent = '❌ WebR nu a putut fi inițializat';
                if (statusElement) statusElement.textContent = '❌ Eroare';
                return;
            }
        }
        
        // IA DATELE DIN INPUT
        let inputValue = '12,45,63,78,43,15,45';
        if (inputField) {
            inputValue = inputField.value || inputValue;
            console.log('📥 Input:', inputValue);
        } else {
            console.warn('⚠️ Elementul #userInput nu există, folosesc valori implicite');
        }
        
        const numbers = inputValue.split(',')
            .map(x => parseFloat(x.trim()))
            .filter(x => !isNaN(x));
        
        console.log('📊 Numere procesate:', numbers);
        
        if (numbers.length === 0) {
            resultElement.textContent = '⚠️ Introdu cel puțin un număr valid!';
            if (statusElement) statusElement.textContent = '⚠️ Date invalide';
            return;
        }
        
        // COD R
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
            
            # Grafic
            library(ggplot2)
            p <- ggplot(data, aes(x = x, y = y)) +
                geom_line(color = "#4A90D9", size = 1.2) +
                geom_point(color = "#E74C3C", size = 4) +
                geom_hline(yintercept = media, linetype = "dashed", 
                          color = "#2ECC71", size = 0.8) +
                labs(
                    title = "📈 Graficul datelor introduse",
                    subtitle = paste("Media =", round(media, 2)),
                    x = "Index observație",
                    y = "Valoare"
                ) +
                theme_minimal() +
                theme(
                    plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
                    plot.subtitle = element_text(hjust = 0.5, size = 12, color = "#555")
                )
            
            ggsave("plot.svg", p, width = 10, height = 6)
            
            list(
                text = rezultat,
                plot = readLines("plot.svg", warn = FALSE)
            )
        `;
        
        console.log('🔧 Execut cod R...');
        const result = await webrInstance.evalR(rCode);
        console.log('✅ Cod R executat');
        
        // Extrage rezultatele
        const textResult = await result.get('text');
        const plotSVG = await result.get('plot');
        
        console.log('📝 Rezultat text primit');
        console.log('🎨 Grafic lungime:', plotSVG ? plotSVG.length : 0);
        
        // Afișează rezultatul
        if (resultElement) {
            resultElement.textContent = textResult || 'Nu s-a primit rezultat';
        }
        
        if (plotElement && plotSVG && plotSVG.length > 0) {
            plotElement.innerHTML = plotSVG.join('\n');
            console.log('✅ Grafic afișat');
        } else if (plotElement) {
            plotElement.innerHTML = '<p style="color:orange;">⚠️ Graficul nu a fost generat</p>';
        }
        
        if (statusElement) statusElement.textContent = '✅ Gata!';
        console.log('✅ Proces complet');
        
    } catch (error) {
        console.error('❌ Eroare:', error);
        if (resultElement) {
            resultElement.textContent = '❌ Eroare: ' + error.message;
        }
        if (statusElement) {
            statusElement.textContent = '❌ Eroare: ' + error.message;
        }
    }
};

// Funcția de inițializare
async function initWebR() {
    console.log('🔄 Inițializez WebR...');
    try {
        const status = document.getElementById('loadingStatus');
        if (status) status.textContent = '⏳ Inițializare WebR... (10-20 secunde)';
        
        webrInstance = new WebR();
        await webrInstance.init();
        console.log('✅ WebR inițializat');
        
        if (status) status.textContent = '⏳ Instalez ggplot2... (5-10 secunde)';
        await webrInstance.installPackages(['ggplot2']);
        console.log('✅ ggplot2 instalat');
        
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
    const status = document.getElementById('loadingStatus');
    if (status) {
        status.textContent = '⏳ Încarcă WebR...';
        status.style.color = '#666';
    }
    
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
});

console.log('✅ Script încărcat complet');
