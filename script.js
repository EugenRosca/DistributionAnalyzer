let webrInstance = null;

// Inițializează WebR
async function initWebR() {
    try {
        if (!webrInstance) {
            webrInstance = new WebR();
           await webrInstance.installPackages(['ggplot2', 'dplyr', 'tidyr']);
            console.log('WebR inițializat cu succes');
            
            // Încarcă pachetele necesare
            await webrInstance.installPackages(['ggplot2']);
        }
        return webrInstance;
    } catch (error) {
        console.error('Eroare la inițializarea WebR:', error);
        document.getElementById('result').textContent = 
            'Eroare la inițializare: ' + error.message;
        return null;
    }
}

// Rulează codul R
async function runRCode() {
    const resultElement = document.getElementById('result');
    const plotElement = document.getElementById('plotOutput');
    
    // Resetare output
    resultElement.textContent = 'Se rulează...';
    plotElement.innerHTML = '';
    
    try {
        // Inițializează WebR dacă nu e inițializat
        const webr = await initWebR();
        if (!webr) return;

        // Ia inputul utilizatorului
        const input = document.getElementById('userInput').value;
        const numbers = input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
        
        if (numbers.length === 0) {
            resultElement.textContent = 'Te rog introdu cel puțin un număr valid!';
            return;
        }

        // Cod R de rulat
        const rCode = `
            library(ggplot2)
            
            # Datele introduse
            data <- data.frame(
                x = 1:${numbers.length},
                y = c(${numbers.join(',')})
            )
            
            # Calcule statistice
            mean_val <- mean(data$y)
            sd_val <- sd(data$y)
            max_val <- max(data$y)
            min_val <- min(data$y)
            
            # Rezultat text
            result_text <- paste(
                "Statistici descriptive:\n",
                "Media: ", round(mean_val, 2), "\n",
                "Deviația standard: ", round(sd_val, 2), "\n",
                "Maxim: ", max_val, "\n",
                "Minim: ", min_val, "\n",
                "Număr de observații: ", length(data$y), "\n"
            )
            
            # Creează graficul
            p <- ggplot(data, aes(x = x, y = y)) +
                geom_line(color = "blue", size = 1) +
                geom_point(color = "red", size = 3) +
                geom_hline(yintercept = mean_val, linetype = "dashed", 
                          color = "green", alpha = 0.7) +
                labs(
                    title = "Graficul datelor introduse",
                    x = "Index",
                    y = "Valoare",
                    caption = "Linia punctată reprezintă media"
                ) +
                theme_minimal() +
                theme(
                    plot.title = element_text(hjust = 0.5, size = 16, face = "bold")
                )
            
            # Salvează graficul ca SVG
            ggsave("plot.svg", p, width = 8, height = 5)
            
            # Returnează rezultatele
            list(
                text = result_text,
                plot = readLines("plot.svg", warn = FALSE)
            )
        `;

        // Rulează codul R
        const result = await webr.evalR(rCode);
        
        // Extrage rezultatele
        const textResult = await result.get('text');
        const plotSVG = await result.get('plot');
        
        // Afișează rezultatul text
        resultElement.textContent = textResult;
        
        // Afișează graficul
        if (plotSVG && plotSVG.length > 0) {
            const svgContent = plotSVG.join('\n');
            plotElement.innerHTML = svgContent;
        } else {
            plotElement.innerHTML = '<p>Graficul nu a putut fi generat.</p>';
        }

    } catch (error) {
        console.error('Eroare la rularea codului R:', error);
        resultElement.textContent = 'Eroare: ' + error.message;
        plotElement.innerHTML = '';
    }
}

// Rulează automat la încărcarea paginii
window.addEventListener('load', () => {
    // Inițializează WebR și rulează exemplul implicit
    initWebR().then(() => {
        setTimeout(runRCode, 500);
    });
});
