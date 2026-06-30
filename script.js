// Inspirat din articolul R-bloggers
console.log('🚀 Pornire aplicație...');

// Configurare WebR cu Shiny
const config = { 
    packages: ['ggplot2', 'dplyr', 'tidyr'] 
};

// Variabile globale
let webR;
let shinyApp;

// Inițializare WebR
async function initWebR() {
    try {
        const status = document.getElementById('loadingStatus');
        status.textContent = '⏳ Încărcare WebR... (10-20 sec)';
        
        // Creează instanța WebR
        webR = new WebR();
        await webR.init();
        
        status.textContent = '⏳ Instalare pachete...';
        
        // Instalează pachetele necesare
        await webR.installPackages(['ggplot2', 'dplyr', 'tidyr']);
        
        status.textContent = '✅ WebR gata! Apasă butonul.';
        status.style.color = 'green';
        console.log('✅ WebR inițializat cu succes');
        
        // Rulează automat după 2 secunde
        setTimeout(runRCode, 1000);
        
        return webR;
    } catch (error) {
        console.error('❌ Eroare inițializare:', error);
        document.getElementById('loadingStatus').innerHTML = 
            '<span style="color:red;">❌ Eroare: ' + error.message + '</span>';
        return null;
    }
}

// Funcția principală - inspirată din exemplul Shiny
async function runRCode() {
    console.log('▶️ Rulează R');
    
    const resultDiv = document.getElementById('result');
    const plotDiv = document.getElementById('plotOutput');
    const statusDiv = document.getElementById('loadingStatus');
    const inputField = document.getElementById('userInput');
    
    resultDiv.textContent = '⏳ Procesare...';
    
    try {
        if (!webR) {
            await initWebR();
            if (!webR) throw new Error('WebR nu e disponibil');
        }
        
        // Ia datele din input
        const input = inputField.value || '12,45,63,78,43,15,45';
        const numbers = input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
        
        if (numbers.length === 0) {
            resultDiv.textContent = '⚠️ Introdu numere valide!';
            return;
        }
        
        console.log('📊 Date:', numbers);
        
        // Cod R - folosind tidyverse și ggplot2
        const code = `
            library(ggplot2)
            library(dplyr)
            library(tidyr)
            
            # Date
            data <- data.frame(
                index = 1:${numbers.length},
                value = c(${numbers.join(',')})
            )
            
            # Statistici
            stats <- data %>%
                summarise(
                    n = n(),
                    suma = sum(value),
                    media = mean(value),
                    mediana = median(value),
                    sd = sd(value),
                    min = min(value),
                    max = max(value),
                    range = max(value) - min(value)
                )
            
            # Rezultat text
            text <- paste(
                "📊 STATISTICI DESCRIPTIVE\n",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
                "📈 Număr observații: ", stats$n, "\n",
                "📊 Suma: ", round(stats$suma, 2), "\n",
                "📊 Media: ", round(stats$media, 2), "\n",
                "📊 Mediana: ", round(stats$mediana, 2), "\n",
                "📊 Deviație standard: ", round(stats$sd, 2), "\n",
                "📊 Minim: ", round(stats$min, 2), "\n",
                "📊 Maxim: ", round(stats$max, 2), "\n",
                "📊 Range: ", round(stats$range, 2), "\n",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            )
            
            # Grafic ggplot2
            p <- ggplot(data, aes(x = index, y = value)) +
                geom_line(color = "#4A90D9", size = 1.2) +
                geom_point(color = "#E74C3C", size = 4) +
                geom_hline(yintercept = stats$media, 
                          linetype = "dashed", 
                          color = "#2ECC71", 
                          size = 0.8) +
                labs(
                    title = "📈 Graficul datelor introduse",
                    subtitle = paste("Media =", round(stats$media, 2)),
                    x = "Index observație",
                    y = "Valoare"
                ) +
                theme_minimal() +
                theme(
                    plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
                    plot.subtitle = element_text(hjust = 0.5, size = 12, color = "#555"),
                    panel.grid.minor = element_blank()
                )
            
            # Salvează graficul
            ggsave("plot.svg", p, width = 10, height = 6, dpi = 100)
            
            list(
                text = text,
                plot = readLines("plot.svg", warn = FALSE)
            )
        `;
        
        console.log('🔧 Execut cod R...');
        const result = await webR.evalR(code);
        
        const text = await result.get('text');
        const plot = await result.get('plot');
        
        resultDiv.textContent = text;
        
        if (plot && plot.length > 0) {
            let svgContent = plot.join('\n');
            svgContent = svgContent.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
            plotDiv.innerHTML = svgContent;
            console.log('✅ Grafic afișat');
        } else {
            plotDiv.innerHTML = '<p style="color:orange;">Graficul nu a fost generat</p>';
        }
        
        statusDiv.textContent = '✅ Gata!';
        console.log('✅ Complet');
        
    } catch (error) {
        console.error('❌ Eroare:', error);
        resultDiv.textContent = '❌ Eroare: ' + error.message;
        statusDiv.innerHTML = '<span style="color:red;">❌ Eroare: ' + error.message + '</span>';
    }
}

// Buton
document.getElementById('runButton').addEventListener('click', runRCode);

// Pornește
setTimeout(initWebR, 500);

console.log('✅ Script gata');
