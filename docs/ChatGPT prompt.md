# prompts

1. I want to build an Angular page similar to ChatGPT UI, give me the code.
2. Write a mock service, I don't want to connect server at development.
3. I want to use material ui framework, apply to chat message and window. BTW, split the page to 2 columns, left hand side is nav col, it keeps a chat history list, with a top section on the top, top section has a "New chat" button , there is also bottom section in hav col, it display username, there is middle major section that showing chat history. the top and bottom sections are fixed, the chat history list can be scroll if there are too many history.
4. it's fixed 2 columns in the page, don't use drawer, use other components.
5. in chat-window.component change form input placeholder to "Send a message.", add a "send icon" inside the button (on the right), click the icon or press enter will send the message, remove the previous send button. the input should have some margins, change the location of input to page bottom, position is fixed, use material as much as possible.
6. in chat-window.component, change background color to 2e2e38, for chat-message, background is 3c3d4a for bot message, 2e2e38 for user message. add margin to the input box.
7. in chat-window.component, change input width to 60% and put it in center of the row. change the icon color to white
8. in nav-col.component, change toolbar background color to 1d1e20, change button font color and border color to white, add an "Add" icon within the button.
9. add a avatar in chat-message card, if sender is user, show a material user icon, is sender is bot, show a assistant icon.
10. add a divider between mat-list and mat-toolbar in nav-col.component.
11. in chat.service, how to delay 1 s and take turn return 3 different json files?
12. how to read json file in the same folder in above private getJsonData().
13. the file1.json content is below, how to read the "content" attribute in above method? `your json content`
14. in chat-window, when the send button is click, render the bot response message immediately with blank content, change the bot avatar to a loading icon, when finish loading the response, will change the avatar back to bot.