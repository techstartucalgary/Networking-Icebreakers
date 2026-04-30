export async function GenerateQuestions(Data: {
    event_description: string;
    n_rows: number;
    n_cols: number;
    tags: string[];
}) {
    try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/bingo/generateBingo`;
        const token = localStorage.getItem('token');

        const response = await fetch(apiUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify(Data),
            });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const responseData = await response.json();

        // The bingo grid is filled with 2d arrays, where each entry is an array of objects. Each object represents a row
        return {
            bingoGrid: responseData.bingo_grid
        };

    } catch (error) {
        console.error("Generating questions failed with error ", error);
        throw error;
    }
}
