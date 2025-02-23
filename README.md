## Launch the Project

This project implements all standard chess moves, rules, and basic checks. It features online 1v1 gameplay (open the application in two tabs to play against another person), local 1v1 on the same device, and player vs. bot modes.

### To Do:

- Implement board flipping for each color's perspective.
- Add login functionality and user color randomization.
- Implement more robust timers.
- Secure the application against vulnerabilities.
- Implement premoves.
- Make the board responsive for different screen sizes.
- Develop an AI opponent that makes optimal moves using deep learning techniques.
- Fix the bug that occurs after castling.

### Running the Project:

1.  Install the required dependencies:

    ```bash
    pip install -r requirements.txt
    ```

2.  Start the development server:

    ```bash
    python manage.py runserver
    ```

**Note:** If you experience issues installing the requirements with the above command, try installing each package individually using `pip install [package_name]==[version_number]` and then run the server.
