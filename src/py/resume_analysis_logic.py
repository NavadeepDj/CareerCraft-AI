
import gradio as gr
from pdfminer.high_level import extract_text
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
import google.generativeai as genai
import os

# Set up Gemini API
# WARNING: Hardcoding API keys is insecure. Use environment variables properly.
# os.environ["GOOGLE_API_KEY"] = "YOUR_API_KEY_HERE" # Replace with your actual key or load securely
# Example loading from env:
# api_key = os.getenv("GOOGLE_API_KEY")
# if not api_key:
#     raise ValueError("GOOGLE_API_KEY environment variable not set.")
# genai.configure(api_key=api_key)


# Attempt to load API key from environment variables
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Initialize Gemini model - Use a valid model name for the configured API version
    # Ensure the model supports the desired functionality (text generation)
    try:
        # Check available models if necessary or use a known compatible one
        model = genai.GenerativeModel('gemini-1.5-flash-latest') # Use the same model as Genkit setup for consistency
        print("Gemini Model Initialized Successfully.")
    except Exception as e:
        print(f"Error initializing Gemini Model: {e}")
        model = None # Ensure model is None if initialization fails
else:
    print("Warning: GOOGLE_API_KEY environment variable not set. AI functions will not work.")
    model = None


# Download necessary NLTK data if not already present
try:
    nltk.data.find('tokenizers/punkt')
except nltk.downloader.DownloadError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except nltk.downloader.DownloadError:
    nltk.download('stopwords')


# Function to clean text by removing markdown-like symbols (* and #)
def clean_text(text):
    if not isinstance(text, str):
        return ""
    return text.replace('*', '').replace('#', '')

def preprocess_text(text):
    if not isinstance(text, str):
        return []
    stop_words = set(stopwords.words('english'))
    try:
        tokens = word_tokenize(text)
    except Exception as e:
        print(f"Error tokenizing text: {e}")
        return []
    tokens = [word.lower() for word in tokens if word.isalpha()]
    tokens = [word for word in tokens if word not in stop_words]
    stemmer = PorterStemmer()
    try:
        tokens = [stemmer.stem(word) for word in tokens]
    except Exception as e:
        print(f"Error stemming tokens: {e}")
        # Decide how to handle stemming errors, e.g., skip stemming
        pass
    return tokens

def _call_genai_model(prompt_text):
    """Helper function to call the GenAI model and handle errors."""
    if not model:
        return "Error: GenAI model not initialized. Please set GOOGLE_API_KEY."
    try:
        response = model.generate_content(prompt_text)
        # Accessing response parts safely
        if hasattr(response, 'text'):
            return clean_text(response.text)
        elif hasattr(response, 'parts') and response.parts:
             # Assuming the first part contains the text if .text is not available
            return clean_text(response.parts[0].text)
        else:
            # Fallback or detailed logging if response structure is unexpected
            print("Unexpected GenAI response structure:", response)
            return "Error: Could not extract text from GenAI response."
    except Exception as e:
        print(f"Error calling GenAI model: {e}")
        return f"Error generating response: {e}"


def extract_entities(text):
    if not isinstance(text, str) or not text.strip():
        return "Error: Invalid input text for entity extraction."
    prompt = f"Extract named entities from the following text and categorize them (e.g., PERSON, ORGANIZATION, SKILL):\n\n{text}"
    return _call_genai_model(prompt)

def process_pdf(pdf_file):
    if pdf_file is None:
        return "", [], "Error: No PDF file provided."
    try:
        # pdf_file from Gradio is a TemporaryFileWrapper object
        text = extract_text(pdf_file.name)
        if not text:
             return "", [], "Error: Could not extract text from PDF."
        tokens = preprocess_text(text)
        entities = extract_entities(text) # Can take time
        return text, tokens, entities
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return "", [], f"Error processing PDF: {e}"


def generate_cover_letter(resume_text, job_title):
    if not isinstance(resume_text, str) or not resume_text.strip():
        return "Error: Resume text is missing or invalid."
    if not isinstance(job_title, str) or not job_title.strip():
        return "Error: Job title is missing or invalid."
    prompt = f"Generate a professional cover letter for a {job_title} position based on the following resume:\n\n{resume_text}"
    return _call_genai_model(prompt)

def analyze_resume(resume_text):
    if not isinstance(resume_text, str) or not resume_text.strip():
        return "Error: Resume text is missing or invalid."
    prompt = f"Analyze the following resume and provide detailed feedback on its structure, content, and areas for improvement:\n\n{resume_text}"
    return _call_genai_model(prompt)

def chatbot_mode(mode, input_text):
    if not isinstance(mode, str) or not mode:
        return "Error: Chatbot mode not selected."
    # Input text is optional, handle if it's None or empty
    input_text = input_text if isinstance(input_text, str) else ""
    prompt = f"Provide detailed tips and advice for {mode} based on the following input:\n\n{input_text}"
    return _call_genai_model(prompt)

def download_resume_template():
    prompt = "Generate a comprehensive and professional resume template with sections for personal information, summary, work experience, education, skills, and additional information. Format it clearly."
    return _call_genai_model(prompt)

def recommend_skills(job_title):
    if not isinstance(job_title, str) or not job_title.strip():
        return "Error: Job title is missing or invalid."
    prompt = f"Recommend a list of essential and desirable skills for a {job_title} position, including both technical and soft skills."
    return _call_genai_model(prompt)

def match_jobs(resume_text, job_title):
    if not isinstance(resume_text, str) or not resume_text.strip():
        return "Error: Resume text is missing or invalid."
    if not isinstance(job_title, str) or not job_title.strip():
        return "Error: Job title is missing or invalid."
    prompt = f"Based on the following resume, suggest potential job matches for the role of {job_title} and explain why they would be a good fit:\n\n{resume_text}"
    return _call_genai_model(prompt)

def calculate_ats_score(resume_text, job_description):
    if not isinstance(resume_text, str) or not resume_text.strip():
        return "Error: Resume text is missing or invalid."
    if not isinstance(job_description, str) or not job_description.strip():
        return "Error: Job description is missing or invalid."
    prompt = f"""Analyze the following resume against the job description and calculate an ATS (Applicant Tracking System) score out of 100. Provide a detailed breakdown of the score, including:
    1. Keyword match percentage
    2. Skills alignment
    3. Experience relevance
    4. Education match
    5. Overall formatting and readability

    Resume:
    {resume_text}

    Job Description:
    {job_description}

    Provide the score and explanation in the following format strictly:
    ATS Score: [score]/100

    Breakdown:
    1. Keyword match: [score]/20
    2. Skills alignment: [score]/20
    3. Experience relevance: [score]/20
    4. Education match: [score]/20
    5. Formatting and readability: [score]/20

    Explanation:
    [Detailed explanation of each component and suggestions for improvement]
    """
    return _call_genai_model(prompt)

# Gradio Interface
def main_interface():
    with gr.Blocks() as demo:
        gr.Markdown("# AI-Powered Resume Builder and Job Matching (Gradio Python Interface)")
        gr.Markdown("Note: This interface runs the Python logic directly and is separate from the main Next.js application.")

        # Define resume_text as a state variable to share across tabs
        resume_text_state = gr.State("")

        with gr.Tab("Upload Resume"):
            gr.Markdown("### Upload your PDF Resume:")
            pdf_file = gr.File(label="Upload PDF Resume")
            # Display outputs from processing
            extracted_text_output = gr.Textbox(label="Extracted Text Preview (from PDF)", lines=10, interactive=False)
            tokens_output = gr.Textbox(label="Preprocessed Tokens", lines=5, interactive=False)
            entities_output = gr.Textbox(label="Extracted Entities", lines=5, interactive=False)

            # When PDF is uploaded, process it and update the state and outputs
            pdf_file.upload(
                process_pdf,
                inputs=pdf_file,
                outputs=[extracted_text_output, tokens_output, entities_output, resume_text_state] # Update state here
             )

        with gr.Tab("Generate Cover Letter"):
            gr.Markdown("### Cover Letter Generator:")
            job_title_cl = gr.Textbox(label="Job Title", lines=1)
            cover_letter_output = gr.Textbox(label="Generated Cover Letter", lines=15)

            generate_cl_btn = gr.Button("Generate Cover Letter")
            # Use resume_text_state as input
            generate_cl_btn.click(generate_cover_letter, inputs=[resume_text_state, job_title_cl], outputs=cover_letter_output)

        with gr.Tab("Resume Analysis and Feedback"):
            gr.Markdown("### Get Feedback on Your Resume:")
            feedback_output = gr.Textbox(label="Resume Feedback", lines=15)

            analyze_btn = gr.Button("Analyze Resume")
            # Use resume_text_state as input
            analyze_btn.click(analyze_resume, inputs=resume_text_state, outputs=feedback_output)

        with gr.Tab("ATS Score Calculator"):
            gr.Markdown("### Calculate Your Resume's ATS Score:")
            job_description_ats = gr.Textbox(label="Job Description", lines=10)
            ats_score_output = gr.Textbox(label="ATS Score and Analysis", lines=20)

            ats_btn = gr.Button("Calculate ATS Score")
             # Use resume_text_state as input
            ats_btn.click(calculate_ats_score, inputs=[resume_text_state, job_description_ats], outputs=ats_score_output)

        with gr.Tab("Chatbot"):
            gr.Markdown("### Chatbot for Resume Building, Career Advice, and Interview Tips:")
            mode_chat = gr.Dropdown(choices=["Resume Building", "Career Advice", "Interview Tips"], label="Chatbot Mode")
            chatbot_input = gr.Textbox(label="Your Question or Context", lines=5) # Changed label and lines
            chatbot_output = gr.Textbox(label="Chatbot Response", lines=15)

            chatbot_btn = gr.Button("Get Response")
            chatbot_btn.click(chatbot_mode, inputs=[mode_chat, chatbot_input], outputs=chatbot_output)

        with gr.Tab("Resume Template"):
            gr.Markdown("### Generate a Professional Resume Template:")
            template_output = gr.Textbox(label="Generated Resume Template", lines=20)

            download_template_btn = gr.Button("Generate Template")
            download_template_btn.click(download_resume_template, outputs=template_output)

        with gr.Tab("Skill Recommendation"):
            gr.Markdown("### Skill Recommendation Based on Job Title:")
            job_title_skill = gr.Textbox(label="Job Title", lines=1)
            skills_output = gr.Textbox(label="Recommended Skills", lines=10)

            recommend_btn = gr.Button("Get Skill Recommendations")
            recommend_btn.click(recommend_skills, inputs=job_title_skill, outputs=skills_output)

        with gr.Tab("Job Matching"):
            gr.Markdown("### Job Matching Based on Your Resume:")
            job_title_match = gr.Textbox(label="Target Job Title", lines=1)
            job_match_output = gr.Textbox(label="Potential Job Matches", lines=15)

            match_btn = gr.Button("Find Job Matches")
             # Use resume_text_state as input
            match_btn.click(match_jobs, inputs=[resume_text_state, job_title_match], outputs=job_match_output)

    return demo

# Note: The Gradio interface (`if __name__ == "__main__":`) will only run
# if this script is executed directly (e.g., `python resume_analysis_logic.py`).
# It does NOT automatically integrate with the Next.js application.
# The functions defined above (like calculate_ats_score) are used by the Genkit flow.
if __name__ == "__main__":
    print("Attempting to launch Gradio interface...")
    if not model:
         print("\nWARNING: Gradio interface launched, but AI features require a valid GOOGLE_API_KEY.\n")
    demo_instance = main_interface()
    try:
        demo_instance.launch()
        print("Gradio interface running. Access it via the URL provided.")
    except Exception as e:
        print(f"Failed to launch Gradio interface: {e}")
        print("This might be due to port conflicts or other Gradio setup issues.")

```