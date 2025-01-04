const { fromEvent, of } = rxjs;
const { map, debounceTime, distinctUntilChanged, switchMap, delay } = rxjs.operators;

async function mockSearchApi(term) {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
    const data = await response.json();
    const filtered = data.filter((item) =>
        item.name.common.toLowerCase().includes(term.toLowerCase())
    );
    return filtered.length > 0 ? filtered : [];
}

const inputElement = document.getElementById('searchInput');
const resultsElement = document.getElementById('results');

fromEvent(inputElement, 'input')
    .pipe(
        map((event) => event.target.value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
            if (!searchTerm) {
                return of([]);
            }
            return mockSearchApi(searchTerm);
        })
    )
    .subscribe({
        next: (results) => {
            resultsElement.innerHTML = results.map((item) => {
                const regex = new RegExp(`(${inputElement.value})`, 'gi');
                const highlightedName = item.name.common.replace(regex, '<b style="color:red">$1</b>');
                return `<li class="list-none">${highlightedName}</li>`;
            }).join('');
        },
        error: (error) => {
            console.error('Error:', error);
        },
        complete: () => {
            console.log('Search complete');
        },
    });
