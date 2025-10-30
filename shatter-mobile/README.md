# Introduction

Our mobile uses: React Native + Expo

# How to run

- Step 1: Clone the repo
  
- Step 2: Enter to `shatter-mobile` dir by running the command in the terminal
```
cd shatter-mobile
```
- Step 3: Install the dependencies and libraries by running
```
npm i
```
- Step 4: Run the mobile app locally
```
npx expo start
```
- Step 5: After running the above command, you will see list of options
```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```
### 1. WINDOW

- If you are using Window -> before pressing `a`, make sure you already installed **Android Studio**. 

- If NOT, follow this guide: https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated

### 2. MACOS

- If you are using Mac -> before pressing `i`, make sure you already installed **XCode**.

- If NOT, follow this guide: https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated

### 3. Use your own phone

- Download the "Expo Go" app in AppStore or CHPlay

- Then scan the QR code in the terminal. It will navigate you to sse our project in this app
  
- Don't need to press any button in the terminal

# Note
- Because you are working on mobile, you are expected to run backend locally to test, check the guide `shatter-backend/README.md`
- Don't push changes directly to main, create your own branch and pull request to merge

