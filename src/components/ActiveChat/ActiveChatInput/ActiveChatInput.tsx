import React from 'react';
import { IoSend } from 'react-icons/io5';
import Button from 'src/components/Button';
import Card from 'src/components/Card';
import ImageUpload from 'src/components/ImageUpload';
import Input from 'src/components/Input';

const ActiveChatInput = ({
  handleSendMessage,
  handleInputChange,
  message,
  inputRef,
}: {
  handleSendMessage: (
    event: React.FormEvent,
    imageUrl?: string,
  ) => Promise<void>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  message: string;
  inputRef: React.RefObject<HTMLInputElement>;
}) => {
  return (
    <div className="pb-2">
      <Card className="px-3 py-4 pb-3 w-full flex">
        <ImageUpload
          onUpload={(event: any, url: string) => handleSendMessage(event, url)}
        />
        <form
          className="rounded-sm flex gap-1 w-full"
          onSubmit={(e) => handleSendMessage(e)}
        >
          <Input
            ref={inputRef}
            id="messages-input"
            type="text"
            value={message}
            className="w-full"
            placeholder="Aa"
            onChange={handleInputChange}
          />
          <span className="border-l border-cyan-500 flex items-center justify-center">
            <Button
              type="submit"
              className="px-3 p-2 rounded-sm ml-1 text-cyan-500"
              icon={<IoSend className="w-4 h-4" />}
            />
          </span>
        </form>
      </Card>
    </div>
  );
};

export default ActiveChatInput;
