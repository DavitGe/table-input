# Rich Text Editor with Excel Tables & Mentions

A powerful Next.js-based rich text editor that supports Excel table pasting and @mentions functionality. This project provides three different versions of the rich text editor with increasing levels of functionality.

## Features

### Basic Version

- Automatic table detection from clipboard
- Visual table rendering within input
- Continue typing around tables
- Multiple table support
- Line break support with Enter key

### Enhanced Version

- All basic features
- Click to select tables
- Delete tables with Delete/Backspace keys
- Visual selection indicators
- Editable table cells
- Better spacing around tables

### Mentions Version

- All enhanced features
- @ trigger for mentions
- Searchable user dropdown
- Keyboard navigation (↑↓ Enter)
- Styled mention pills
- Real-time filtering

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

### Tables

1. Copy data from Excel or any tabular source
2. Paste directly into any of the rich text editors
3. Tables will be automatically detected and formatted
4. In the Enhanced and Mentions versions:
   - Click on a table to select it
   - Press Delete or Backspace to remove the selected table
   - Edit table cells directly

### Mentions

1. Type `@` to trigger the mentions dropdown
2. Start typing a name to filter the list
3. Use ↑↓ arrow keys to navigate the dropdown
4. Press Enter or Tab to select a mention
5. Press Escape to cancel mention selection
6. Click on a mention in the dropdown to select it

## Available Mentions

- 👨‍💼 John Doe
- 👩‍💼 Jane Smith
- 👨‍🔧 Bob Johnson
- 👩‍🎨 Alice Brown
- 👨‍🏫 Charlie Wilson
- 👩‍⚕️ Diana Prince

## Sample Data for Testing

### Employee Data

```
Name        Department  Salary  Years
John Doe    Engineering 75000   3
Jane Smith  Marketing   65000   5
Bob Johnson Sales       55000   2
Alice Brown HR          60000   7
```

### Sales Data

```
Month     Revenue   Units   Growth
January   $50,000   1,200   +5%
February  $45,000   1,100   -10%
March     $60,000   1,400   +33%
April     $55,000   1,300   -8%
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── RichTextInput.tsx           # Basic version
│   │   ├── EnhancedRichTextInput.tsx   # Enhanced version
│   │   ├── RichTextInputWithMentions.tsx # Mentions version
│   │   └── table-styles.css            # Table styling
│   ├── page.tsx                        # Main page
│   └── globals.css                     # Global styles
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
