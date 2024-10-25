import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ContentScriptContext } from 'wxt/client';

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'], // Match LinkedIn pages
  async main(ctx: ContentScriptContext) {
    const ui = await createUi(ctx);
    ui.mount();
  },
});

function createUi(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: 'sticker-extension',
    position: 'inline',
    append: 'first',
    onMount(uiContainer, shadow) {
      const app = document.createElement('div');
      uiContainer.append(app);

      // Render React component into the UI container
      const root = ReactDOM.createRoot(app);
      root.render(
        <React.StrictMode>
          <StickerApp />
        </React.StrictMode>
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
    },
  });
}

function StickerApp() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [generatedText, setGeneratedText] = useState('');

  useEffect(() => {
    const chatURLPattern = /messaging\/thread\/.+/;
    let currentURL = window.location.href;

    const interval = setInterval(() => {
      if (window.location.href !== currentURL) {
        currentURL = window.location.href;
        if (chatURLPattern.test(currentURL)) {
          initSticker();
        } else {
          removeSticker();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initSticker = () => {
    const chatInput = document.querySelector('div.msg-form__contenteditable');
    if (chatInput) {
      const sticker = document.createElement('div');
      sticker.textContent = '✨';
      sticker.className = 'absolute bg-yellow-400 p-2 rounded-full cursor-pointer text-xl z-50';
      document.body.appendChild(sticker);

      const rect = chatInput.getBoundingClientRect();
      sticker.style.top = `${rect.top + window.scrollY + 50}px`;
      sticker.style.left = `${rect.left + window.scrollX + rect.width - 50}px`;

      sticker.addEventListener('click', () => setIsModalVisible(true));

      chatInput.addEventListener('focus', () => {
        sticker.style.display = 'block';
      });
    }
  };

  const removeSticker = () => {
    const sticker = document.querySelector('div[msg-form__contenteditable]');
    if (sticker) sticker.style.display = 'none';
  };

  const handleGenerateText = () => {
    if (userInput) {
      setGeneratedText('Thank you for the opportunity! If you have any more questions or if there’s anything else I can help you with, feel free to ask.');
    }
  };

  const handleInsertText = () => {
    const chatInput = document.querySelector('div.msg-form__contenteditable');
    if (chatInput) {
      chatInput.focus();
      document.execCommand('insertText', false, generatedText);
      setIsModalVisible(false);
    }
  };

  return (
    <>
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-2000">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter text..."
              className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
            />
            <div className="flex justify-between">
              <button
                onClick={handleGenerateText}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Generate
              </button>
              <button
                onClick={handleInsertText}
                disabled={!generatedText}
                className={`py-2 px-4 rounded-lg ${generatedText ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Insert
              </button>
              <button
                onClick={() => setIsModalVisible(false)}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                Close
              </button>
            </div>
            {generatedText && <p className="mt-4">Generated: {generatedText}</p>}
          </div>
        </div>
      )}
    </>
  );
}
 