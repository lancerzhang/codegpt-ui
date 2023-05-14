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
15. change the spinner size to same as user icon, and change color to white
16. in chat-message, the message is markdown format, how to display it ?
17. I want to store the conversation to browser IndexedDB
18. There should be 2 tables, conversations & messages. There should be a conversationId path param in the url. If the param is 'new', for the 1st message in the conversation, will insert a record to conversations table first, and then insert a message. If param is not 'new' or it's not 1st message, just insert a message. If there is  conversationId in the param, will load existing messages.
19. add last modified time to conversations and created time to messages
20. I want to load the conversations to nav-col component, display them sort by 'lastUpdatedAt' desc.
21. put a chat icon left besides the title, when click the item, when the item is selected, display 2 icons (edit and delete) on the right side.
22. when click the item, if path is not "/chats/:conversationId", will navigate to "/chats/:conversationId", if path match "/chats/:conversationId", display the 2 icons (edit / delete)
23. when click deleteChat icon, will prompt a confirmation dialog, if confirm, will delete the chat from db. when click editChat icon, will prompt a dialog, allow user to modify the title.
24. nav-col and chat-window are under home component, how can chat-window call loadChats() method in nav-col?
25. for this route 'chat/:conversationId', I navigated from chat/1 to chat/2, the component do not refresh, why?
26. I want to write a prompt service, which will will read a prompts.csv in assets folder each time when the service is initialized, the csv has 2 columns, ‘act’ and ‘prompt’, store all ‘prompt’ as a list variable systemPrompts, each object in the list has 2 fields, ‘id’ and ‘prompt’, id is md5 hash of ‘prompt’.
27. And add a fuzzy search method in the service, if will search both ‘act’ and ‘prompt’ fields, then return results (limit to 10).
28. in this chat-window component, I want to monitor the content of textarea, if it's start by slash, it will get the textarea value (without first char /) and call prompt-service to search, and show the prompts above textarea, allow user to select the prompt, if user select the prompt, will fill into textarea.
29. I have a chat-api service which handle openai request/response, I want to read dummy files when running locally, but use http request when running on server, how to do that?
30. I want to add a field of “number of tokens” for the user and bot message, user tokens is in “response.data.usage.prompt_tokens”, bot token is in “response.data.usage.completion_tokens”, update this field after getting the response
31. In below sendMessage() method, chatApiService.getResponse should accept array input. We should prepare the array before this.messages.push(), each message in the array is an object {"role": "user", "content": “the “question}, if sender is ’bot’, the role is ‘system’. There is a param maxContextTokens in environment, we need to reverse loop messages, take the historical messages that not exceed maxContextTokens, and then append new user messages, and then send to chatApiService.getResponse()  `your code`
32. I want the http to post such request body, { "apiVersion": environment.apiVersion, "model": environment.model, "messages": messages }.
33. In chat-message below, add a plus icon button under user icon, if message attribute “isPrompt” is true, will disable it, “isPrompt” is false, will enable it, When click the icon, will call parent’s (chat-window) addPrompt() method. `your code`
34. This is the parent component, add isPrompt to message object, its default value is false. When addPrompt() is called, will change it true.
35. Below PromptService should load user prompts from ChatDbService as well when initialize it.`your code`

# Notes
1. GPT is not good at large tasks, it's good at small tasks, so we need to split the task into small pieces, and then send to GPT.
2. GTP is not good at 3rd library, version difference of libraries, we'd better to check on official website.