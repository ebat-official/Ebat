
export type AIAction =
  | "MakeLong"
  | "MakeShort"
  | "FixSpellingGrammar"
  | "ImproveWriting"
  | "ChatWithSelectedString"
  | "autoComplete"
  | "GenerateAgain"
  | "SimplifyLanguage"
  | "WriteHint"
  | "Steps"
  | "askPageQuestion";

const GenerateAgainInstruction = `
        Create a system that allows the AI to regenerate its response if the user is not satisfied with the initial answer.
            # Steps
              1. Upon receiving a user query, generate an initial response.
              2. Provide the option for the user to indicate whether they are satisfied with the response.
              3. If the user indicates dissatisfaction, immediately offer to regenerate a new response.
              4. Regenerate the response using new phrasing or additional context to better address the user's query.
              5. Repeat the option to indicate satisfaction for the regenerated response.
              
            # Output Format
            
              - Initial response: A complete and concise answer to the user's query.
              - User satisfaction indicator: A simple prompt (e.g., "Are you satisfied with this response? [Yes/No]")
              - Regenerated response: A new version of the response, aimed at rectifying any deficiencies in the initial answer.
            
            # Notes
            
              - The system should ensure that regenerated responses do not simply rephrase but enhance the content or depth based on assumed user dissatisfaction causes.
              - Keep track of regenerated responses to avoid repeating the same or overly similar answers.
              - Consider limitations to the number of regenerated responses to manage system performance and user experience.`;



const autoCompleteInstruction=`        Generate a completion without combining it with the user's text. Limit the response to a concise length and do not include additional commentary or explanations.`
const improveMesgInstruction= `Provide constructive feedback to improve the writing of a user, focusing on clarity, grammar, style, and coherence. 
Assess the user's writing thoughtfully before providing feedback, ensuring to highlight both strengths and areas for improvement. Offer specific, actionable suggestions to help the user enhance their writing skills.

# Steps

1. **Read and Analyze** the provided text to understand its context, purpose, and audience.
2. **Identify Strengths**: Note areas where the user excels in their writing.
3. **Highlight Issues**: Identify aspects that need improvement, such as grammatical errors, awkward phrasing, or unclear arguments.
4. **Provide Suggestions**: Offer clear, practical advice on how to address the identified issues.
5. **Conclude with Encouragement**: Motivate the user to apply the feedback and continue improving their writing.

# Output Format

Provide feedback in a structured paragraph format. Use bullet points or numbered lists for specific suggestions when needed.

# Examples

**User's Text:**  
"I think it's important because to the happiness of people is sometimes underestimated but more important than money."

**Feedback:**  
- Strengths: Your writing demonstrates a passionate perspective on the importance of happiness.
- Issues:
  - The sentence is somewhat confusing due to misplaced phrases.
  - There is a grammatical error with the use of "because."
- Suggestions:
  1. Consider rephrasing for clarity: "I believe happiness is often underrated and is more important than money."
  2. Remove unnecessary words that obstruct the message.

**User's Text:**  
"The cat swiftly leaped over the wall, its movements were agile and graceful, capturing the attention of everyone nearby."

**Feedback:**  
- Strengths: Vivid imagery is successfully used to engage the reader.
- Issues:
  - The sentence could be split for better readability.
- Suggestions:
  1. Break the sentence into two: "The cat swiftly leaped over the wall. Its movements were agile and graceful, capturing the attention of everyone nearby."

# Notes

- Tailor feedback according to the level of the user's proficiency.
- Be specific in your suggestions to aid clarity and understanding.
- Encourage sustained practice and application of advice for continuous improvement.`


const FixSpellingGrammarInstruction=`Correct any spelling and grammar errors in a given text.

# Steps

1. Read the provided text carefully.
2. Identify any spelling mistakes and correct them.
3. Look for grammatical errors, such as incorrect verb tense, subject-verb agreement, punctuation errors, and incomplete sentences, and correct them.
4. Ensure the text flows logically and coherently without altering the original meaning.
5. Double-check the revised text for any remaining errors.

# Output Format

The corrected text should be provided in a clear and readable paragraph format, preserving the original structure and meaning as much as possible. 

# Examples

**Input:** "i has go to the store yesterday for buy some apples"

**Output:** "I went to the store yesterday to buy some apples."

**Input:** "She dont like to play soccer, she prefers basketball."

**Output:** "She doesn't like to play soccer; she prefers basketball."`



// stop
const MakeShortInstruction=`    
Shorten the provided text while keeping its context intact.

# Steps

1. Read the provided text carefully.
2. Identify sections that can be condensed without losing key information.
3. Rephrase or remove redundant or non-essential parts of the text.
4. Ensure the revised text retains its original context and meaning.

# Output Format

The shortened text should be presented in a clear and concise paragraph format, preserving the original context as much as possible. 

# Examples

**Input:** "I had to go to the store yesterday to buy some supplies because we were running low."

**Output:** "I went to the store yesterday for supplies."

**Input:** "Although she doesn't like playing soccer, she enjoys basketball more and plays it every weekend."

**Output:** "She prefers basketball over soccer, playing it weekly.""`

const MakeLongInstruction=` Expand the provided short text while keeping its context intact.

          # Steps

          1. Read the provided text carefully.
          2. Identify areas where additional details or elaborations can be added.
          3. Expand sections with relevant information while maintaining the original context and meaning.
          4. Ensure the expanded text preserves its original message and tone.

          # Output Format

          The expanded text should be presented in a detailed paragraph format, enriching the original content while preserving its context as much as possible. 

          # Examples

          **Input:** "I went to the store for supplies."

          **Output:** "Yesterday, I went to the local store, which I hadn't visited in a while, to purchase a range of supplies. This included essential items we needed because we were running low, such as groceries, cleaning products, and some personal items."

          **Input:** "She prefers basketball over soccer."

          **Output:** "While she appreciates the dynamics of soccer, she finds basketball much more engaging and enjoyable. She actively participates in basketball games every weekend because it's her favorite sport, and she loves practicing different techniques and plays with her friends."`




const SimplifyLanguageInstruction=`
  Simplify the language of the provided text, ensuring it remains clear, concise, and easy to understand.

# Steps

1. Read the given text carefully to understand its meaning.
2. Identify complex words or phrases that could be simplified.
3. Replace complex words or structures with simpler alternatives while retaining the original meaning.
4. Ensure the resulting text maintains coherence and readability.

# Output Format

Provide the simplified version of the text in one or more paragraphs, maintaining proper grammar and structure.

# Examples

**Input:**  
"The utilization of advanced computational methodologies can facilitate the enhancement of operational efficiency in various industries."

**Output:**  
"Using advanced computing methods can help make different industries more efficient."

# Notes

- Avoid oversimplifying technical terms that are necessary for understanding.
- Maintain the integrity and original intent of the text.
- Additional context or explanation should only be added if it aids in clarity.
`
const WriteHintInstruction=`
 Generate a concise message based on the provided context and user input, categorized by type such as error, success, info, or warning. Ensure that the message does not exceed 50 words. 
        # Steps

        1. **Understand Context**: Read the provided context and user input carefully to identify the nature of the message needed.
        2. **Determine Message Type**: Classify the message type as one of the following - error, success, info, or warning.
        3. **Compose Message**: Write a clear, concise message appropriate for the determined type, ensuring it aligns with the context provided.
        4. **Word Count Check**: Confirm the message does not exceed 50 words.

        # Output Format

        Provide a message in plain text, not exceeding 50 words.

        # Examples

        **Example 1**

        - Context: User input failed due to network timeout.
        - Type: Error
        - Message: "The operation could not be completed due to a network timeout. Please check your internet connection and try again."

        **Example 2**

        - Context: User successfully uploaded a file.
        - Type: Success
        - Message: "Your file has been uploaded successfully. You can now access it from your dashboard."

        **Example 3**

        - Context: Upcoming system maintenance scheduled.
        - Type: Info
        - Message: "Please note that the system will undergo maintenance on [Date] from [Start Time] to [End Time]. During this period, access may be limited."

        **Example 4**

        - Context: User attempting risky operation.
        - Type: Warning
        - Message: "Are you sure you want to proceed? This action could affect your system stability. Please proceed with caution."

        # Notes
        -make sure do not Reponse with anything except the message.
        - Ensure the tone and content of the message accurately reflect the message type and context.
        - Be mindful of the word limit while maintaining clarity and precision in the message`


const StepsInstruction=`
Generate a structured response in the format of a JSON object, detailing the given topic as steps.

- Each step should contain three elements: "id", "title", and "content".
- "id" should be a unique identifier starting from 0 and increasing sequentially.
- "title" should summarize the step in a concise manner.
- "content" should provide an explanation or additional details about the step.

# Steps

1. Break the topic down into logical, sequential steps.
2. Begin each step with an incrementing "id" starting from 0.
3. Write a "title" for each step summarizing its objective.
4. Elaborate on the details of the step in the "content" field.

# Output Format

Your response should be a JSON array where each item follows this structure:

{
  "id": [sequential integer starting from 0],
  "title": "[step title]",
  "content": "[step explanation]"


# Examples

**Input:** "Preparing a simple meal"

**Output:**

[
  {
    "id": 0,
    "title": "gather ingredients",
    "content": "List and assemble all the ingredients required for the recipe."
  },
  {
    "id": 1,
    "title": "prepare ingredients",
    "content": "Wash, chop, and measure the ingredients as needed for the recipe."
  },
  {
    "id": 2,
    "title": "begin cooking",
    "content": "Follow the recipe steps to cook the meal, starting with heating the pan."
  }
]

# Notes

- Be concise in writing titles, yet comprehensive in content explanations.
- Ensure the steps are logically ordered and cover the task comprehensively.
`

export {
    GenerateAgainInstruction,
    autoCompleteInstruction,
    improveMesgInstruction,
    FixSpellingGrammarInstruction,
    MakeLongInstruction,
    MakeShortInstruction,
    SimplifyLanguageInstruction,
    WriteHintInstruction,
    StepsInstruction,
}