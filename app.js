// Import RxJS modules from the global scope (via UMD). 
// If you’re using a bundler (Webpack, Vite, etc.), you’d import from 'rxjs' and 'rxjs/operators'
const { fromEvent, of } = rxjs;
const { map, debounceTime, distinctUntilChanged, switchMap, delay } = rxjs.operators;


// Mock API call that returns an Observable
async function mockSearchApi(term) {
    const data = await (await fetch('https://restcountries.com/v3.1/all?fields=name')).json();
    const filtered = data.filter((item) =>
        item.name.common.toLowerCase().includes(term.toLowerCase())
    );
    // Simulate an async request using of() and a small delay
    return filtered.length > 0 ? filtered : [];
}

// Get DOM elements
const inputElement = document.getElementById('searchInput');
const resultsElement = document.getElementById('results');

// Listen to input events
fromEvent(inputElement, 'input')
    .pipe(
        // Extract the value from the input event
        map((event) => event.target.value.trim()),

        // Wait for the user to stop typing for 300ms
        debounceTime(300),

        // Only search if the value changed from the last emission
        distinctUntilChanged(),

        // For each search term, switch to a new Observable (the mock API call)
        switchMap((searchTerm) => {
            // If the user clears the input, return an empty array
            if (!searchTerm) {
                return of([]);
            }
            return mockSearchApi(searchTerm);
        })
    )
    .subscribe({
        next: (results) => {
            // Display the results
            console.log('Results:', results);
            resultsElement.innerHTML = results.map((item) => `<div>${item.name.common}</div>`).join('');
        },
        error: (error) => {
            console.error('Error:', error);
        },
        complete: () => {
            console.log('Search complete');
        },
    });
