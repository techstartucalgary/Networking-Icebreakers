export async function GenerateIndividualQuestions(Data: {
    event_description: string;
    bingo_grid: string[][];
    tags: string[];
    bingo_question_target: string[];
}) {
    try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/bingo/generateBingo/individual`;
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

        if (responseData.status === false) {
            throw new Error(`API responded with an error: ${responseData.msg}`);
        }
        // The bingo grid is filled with 2d arrays, where each entry is an array of objects. Each object represents a row
        return responseData.new_questions;

    } catch (error) {
        console.error("Generating questions failed with error ", error);
        throw error;
    }
}
