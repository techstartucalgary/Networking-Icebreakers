/**
 * Prompt builder utility class.
 * 
 * Allows incremental construction of a prompt string
 * from multiple parts, joined by a configurable separator.
 */
class Prompt {

  private promptParts: string[];
  private separator: string;
  private promptString: string;

  
  /**
   * Creates a new Prompt instance.
   * 
   * @param arr - Initial array of prompt parts.
   * @param separator - String used to separate parts when generating the full prompt.
   */
  public constructor(arr: string[] = [], separator: string = "\n\n") {
    this.promptParts = arr;
    this.separator = separator;
    this.promptString = arr.join(this.separator);
  }

  /**
   * Returns the current array of prompt parts.
   * 
   * @returns Array of prompt segments.
   */
  public getPromptParts(): string[] {
    return this.promptParts;
  }

  /**
   * Replaces the current prompt parts with a new array
   * and regenerates the full prompt string.
   * 
   * @param arr - New array of prompt segments.
   */
  public setPromptParts(arr: string[]): void {
    this.promptParts = arr;
    this.generatePrompt();
  }

  /**
   * Adds a new part to the prompt and regenerates
   * the full prompt string.
   * 
   * @param part - A string segment to append to the prompt.
   */
  public addPart(part: string): void {
    this.promptParts.push(part);
    this.generatePrompt();
  }

  /**
   * Regenerates the full prompt string by joining
   * all prompt parts using the configured separator.
   */
  public generatePrompt(): void {
    this.promptString = this.promptParts.join(this.separator);
  }

  /**
   * Returns the fully generated prompt string.
   * 
   * @returns The complete prompt as a single string.
   */
  public getPrompt(): string {
    return this.promptString;
  }

}
