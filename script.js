let webrInstance = null;
let isInitialized = false;

// Inițializează WebR
async function initWebR() {
    try {
        if (!webrInstance) {
            const resultElement = document.getElementById('result');
            resultElement.textContent = '⏳ Se inițializează WebR... Așteaptă câteva secunde...';
            
            webrInstance = new WebR();
            await webrInstance.init();
            
            // Instalează pachetele necesare
            resultElement.textContent = '⏳ Se instalează pachetele R...';
            await webrInstance.installPackages(['ggplot2']);
            
            isInitialized = true;
            console.log('✅ WebR inițializat cu succes');
            resultElement.textContent = '✅ WebR pregătit! Introdu datele și apasă "Rulează R"';
            
            // Rulează automat exemplul
            setTimeout(runRCode, 300);
        }
        return webrInstance;
    } catch (error) {
        console.error('Eroare la inițializarea WebR:', error);
        document.getElementById('result').textContent = 
            '❌ Eroare la inițializare: ' + error.message;
        return null;
    }
}

// Validează inputul
function validateInput(input) {
    if (!input || input.trim() === '') {
        throw new Error('Te rog introdu cel puțin un număr!');
    }
    
    const numbers = input.split(',').map(x => {
        const trimmed = x.trim();
        const num = parseFloat(trimmed);
        if (isNaN(num)) {
            throw new Error(`"${trimmed}" nu este un număr valid!`);
        }
        return num;
    });
    
    if (numbers.length === 0) {
        throw new Error('Te rog introdu cel puțin un număr valid!');
    }
    
    if (numbers.length < 2) {
        throw new Error('Te rog introdu cel puțin 2 numere pentru statistici relevante!');
    }
    
    return numbers;
}

// Rulează codul R
async function runRCode() {
    const resultElement = document.getElementById('result');
    const plotElement = document.getElementById('plotOutput');
    
    // Resetare output
    resultElement.textContent = '⏳ Se procesează...';
    plotElement.innerHTML = '<p style="color: #666;">⏳ Se generează graficul...</p>';
    
    try {
        // Inițializează WebR dacă nu e inițializat
        if (!isInitialized) {
            await initWebR();
            if (!isInitialized) return;
        }

        // Ia inputul utilizatorului
        const inputField = document.getElementById('userInput');
        const input = inputField.value;
        
        // Validează inputul
        let numbers;
        try {
            numbers = validateInput(input);
        } catch (validationError) {
            resultElement.textContent = '⚠️ ' + validationError.message;
            plotElement.innerHTML = '';
            return;
        }
        
        // Pregătește datele pentru R
        const numbersStr = numbers.join(',');
        const n = numbers.length;
        
        // Calculează statistici în JavaScript pentru afișare rapidă
        const mean = numbers.reduce((a, b) => a + b, 0) / n;
        const sorted = [...numbers].sort((a, b) => a - b);
        const median = n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
        const min = Math.min(...numbers);
        const max = Math.max(...numbers);
        
        // Cod R de rulat
        const rCode = `
            # Încarcă pachetele
            library(ggplot2)
            
            # Datele introduse de utilizator
            data <- data.frame(
                x = 1:${n},
                y = c(${numbersStr})
            )
            
            # Verifică datele
            if (nrow(data) < 2) {
                stop("Sunt necesare cel puțin 2 observații")
            }
            
            # Calcule statistice
            mean_val <- mean(data$y, na.rm = TRUE)
            sd_val <- sd(data$y, na.rm = TRUE)
            max_val <- max(data$y, na.rm = TRUE)
            min_val <- min(data$y, na.rm = TRUE)
            median_val <- median(data$y, na.rm = TRUE)
            sum_val <- sum(data$y, na.rm = TRUE)
            
            # Rezultat text
            result_text <- paste(
                "📊 STATISTICI DESCRIPTIVE\n",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
                "📈 Număr observații: ", nrow(data), "\n",
                "📊 Suma: ", round(sum_val, 2), "\n",
                "📊 Media: ", round(mean_val, 2), "\n",
                "📊 Mediana: ", round(median_val, 2), "\n",
                "📊 Deviația standard: ", round(sd_val, 2), "\n",
                "📊 Minim: ", round(min_val, 2), "\n",
                "📊 Maxim: ", round(max_val, 2), "\n",
                "📊 Range: ", round(max_val - min_val, 2), "\n",
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            )
            
            # Creează graficul
            p <- ggplot(data, aes(x = x, y = y)) +
                geom_line(color = "#4A90D9", size = 1.2) +
                geom_point(color = "#E74C3C", size = 4, alpha = 0.8) +
                geom_hline(yintercept = mean_val, 
                          linetype = "dashed", 
                          color = "#2ECC71", 
                          size = 0.8,
                          alpha = 0.7) +
                geom_hline(yintercept = median_val, 
                          linetype = "dotted", 
                          color = "#F39C12", 
                          size = 0.8,
                          alpha = 0.7) +
                labs(
                    title = "📈 Vizualizarea datelor introduse",
                    subtitle = paste("Media =", round(mean_val, 2), 
                                   "| Mediana =", round(median_val, 2)),
                    x = "Index observație",
                    y = "Valoare",
                    caption = "Linia întreruptă = Media | Linia punctată = Mediana"
                ) +
                theme_minimal() +
                theme(
                    plot.title = element_text(hjust = 0.5, size = 18, face = "bold"),
                    plot.subtitle = element_text(hjust = 0.5, size = 14, color = "#555"),
                    plot.caption = element_text(size = 10, color = "#777"),
                    axis.title = element_text(size = 12, face = "bold"),
                    axis.text = element_text(size = 11),
                    panel.grid.minor = element_blank(),
                    panel.grid.major = element_line(color = "#E8E8E8", size = 0.5)
                )
            
            # Salvează graficul ca SVG
            ggsave("plot.svg", p, width = 10, height = 6, dpi = 100)
            
            # Citește graficul
            plot_lines <- readLines("plot.svg", warn = FALSE)
            
            # Returnează rezultatele
            list(
                text = result_text,
                plot = plot_lines,
                n = nrow(data)
            )
        `;

        // Rulează codul R
        const result = await webrInstance.evalR(rCode);
        
        // Extrage rezultatele
        const textResult = await result.get('text');
        const plotSVG = await result.get('plot');
        const nObs = await result.get('n');
        
        // Afișează rezultatul text
        resultElement.textContent = textResult;
        
        // Afișează graficul
        if (plotSVG && plotSVG.length > 0) {
            const svgContent = plotSVG.join('\n');
            plotElement.innerHTML = svgContent;
        } else {
            plotElement.innerHTML = '<p style="color: #e74c3c;">❌ Graficul nu a putut fi generat.</p>';
        }

    } catch (error) {
        console.error('Eroare la rularea codului R:', error);
        resultElement.textContent = '❌ Eroare: ' + error.message;
        plotElement.innerHTML = '';
    }
}

// Rulează la încărcarea paginii
window.addEventListener('load', () => {
    initWebR();
});

// Permite rularea cu Enter
document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('userInput');
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                runRCode();
            }
        });
    }
});
