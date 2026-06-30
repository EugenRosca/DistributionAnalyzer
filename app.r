# Acesta este codul R original pe care îl transformăm
library(ggplot2)

# Funcție pentru analiza datelor
analizeaza_date <- function(numbers) {
    data <- data.frame(
        x = seq_along(numbers),
        y = numbers
    )
    
    # Calcule statistice
    stats <- list(
        media = mean(numbers),
        sd = sd(numbers),
        max = max(numbers),
        min = min(numbers),
        n = length(numbers)
    )
    
    # Creează grafic
    p <- ggplot(data, aes(x = x, y = y)) +
        geom_line(color = "blue", size = 1) +
        geom_point(color = "red", size = 3) +
        geom_hline(yintercept = stats$media, 
                  linetype = "dashed", color = "green") +
        labs(title = "Analiza datelor",
             x = "Index", y = "Valoare") +
        theme_minimal()
    
    return(list(stats = stats, plot = p))
}

# Exemplu de utilizare
date_exemplu <- c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
rezultat <- analizeaza_date(date_exemplu)
print(rezultat$stats)
print(rezultat$plot)
