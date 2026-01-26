import sys

def get_multiline_input(prompt):
    print(f"\n{prompt}")
    print("(Press Ctrl+Z then Enter on Windows, or Ctrl+D on Linux/Mac to finish)")
    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        pass
    return "\n".join(lines).strip()

def main():
    print("\n===================================================")
    print("   THARUNADITYA'S BLOG PROMPT GENERATOR V1.0     ")
    print("===================================================\n")

    # 1. Series Name
    series_name = input("1. Series Name (e.g., Microarchitecture Attacks): ").strip()
    
    # 2. Part Name / Concept
    part_info = input("\n2. Part Number & Concept (e.g., Part 3: Flush+Reload): ").strip()
    
    # 3. Key Inclusions
    key_inclusions = input("\n3. Major Inclusions / Real World Context: ").strip()
    
    # 4. Raw Notes (Multiline)
    raw_notes = get_multiline_input("4. Paste your Raw Analysis / Notes below:")

    # Construct the Prompt
    final_prompt = f"""
***
**ROLE:** You are **Tharunaditya Anuganti**, a Security Researcher @ Intel and expert technical writer. 
**TASK:** Write a blog post for the series **"{series_name}"**.

**YOUR WRITING STYLE (THE "THARUNADITYA METHOD"):**
1.  **Atomic Deconstruction:** Never just describe *what* happens. Break it down into:
    *   **The Architectural View:** What the programmer sees/logic says.
    *   **The Internal View:** What the CPU/OS effectively does.
    *   **The Gap:** The vulnerability/mechanism lies in the difference.
2.  **Phase-Based Execution:** Algorithms and attacks must be explained in strict, numbered phases (e.g., 1. Preparation, 2. Training, 3. Trigger).
3.  **No Fluff:** Start immediately with the core technical definition.
4.  **Mental Modeling:** Use anthropomorphic language for execution flow (e.g., "The CPU asks itself...", "The branch predictor learns a habit...").
5.  **Technical Depth:** Include the "Invisible" details—Registers, Cache Lines, Hex dumps, Voltage levels, etc.

**POST METADATA:**
*   **Series:** {series_name}
*   **Part/Topic:** {part_info}
*   **Required Context/Inclusions:** {key_inclusions}

**RAW ANALYSIS / NOTES (Use these to form the core logic):**
{raw_notes if raw_notes else "[No specific notes provided. Rely on expert knowledge following the style above.]"}

**OUTPUT FORMAT:**
*   **Front Matter:** Standard Jekyll format for `_posts` with correct tags and series metadata.
*   **Content Structure:** Concept Definition -> Mechanism (Step-by-Step) -> Deep Dive -> Real World Impact.
***
"""

    print("\n" + "="*60)
    print("      COPY THE TEXT BELOW AND PASTE IT TO THE AI      ")
    print("="*60)
    print(final_prompt)
    print("="*60)

if __name__ == "__main__":
    main()
