async function getExchangeRate() {
    const apiKey = "bca27f5a48-e9826cec72-t1e4cy";
    const url = "https://api.fastforex.io/fetch-multi?from=USD&to=MYR&api_key=" + apiKey;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("HTTP error " + response.status);

        const data = await response.json();
        // FastForex returns something like { results: { MYR: 4.66 } }
        const rate = data.results?.MYR || "N/A";

        document.getElementById("exchangeRate").textContent = rate;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        document.getElementById("exchangeRate").textContent = "Failed to load rate.";
    }
}

window.addEventListener("load", getExchangeRate);
