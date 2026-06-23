# Dagi Fast Food Fonts Directory

Welcome to the custom fonts directory! This folder is served at the path `/fonts/` on your application.

## How to use your custom font in the application

Follow these simple steps to add and use your own font:

1. **Upload your font file**:
   Upload your font file (for example, `.ttf`, `.woff`, or `.woff2`) into this `/public/fonts/` folder using the file explorer on the left.
   
2. **Rename or identify your file**:
   Suppose your font file is named `MyCustomFont.ttf`.

3. **Configure the font in `src/index.css`**:
   Open `src/index.css` and locate the `@font-face` block. 
   Simply change the `url` to point to your new font file:
   
   ```css
   @font-face {
     font-family: 'EthiopicCustom';
     /* Change '/fonts/custom.ttf' below to your uploaded font's filename, e.g. '/fonts/MyCustomFont.ttf' */
     src: url('/fonts/MyCustomFont.ttf') format('truetype');
     font-weight: normal;
     font-style: normal;
     font-display: swap;
   }
   ```

4. **That's it!**:
   The application is already configured to automatically load the font-family `'EthiopicCustom'` for all Amharic/Ethiopic texts!
