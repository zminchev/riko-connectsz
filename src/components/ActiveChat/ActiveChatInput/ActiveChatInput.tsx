import React from "react";
import Card from "src/components/Card";
import Input from "src/components/Input";

const ActiveChatInput = () => {
  const [message, setMessage] = React.useState("");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  return (
    <div className="px-4 pt-4 mb-2">
      <Card className="p-3 w-full">
        <Input
          id="messages-input"
          type="text"
          value={message}
          placeholder="Aa"
          onChange={handleInputChange}
        />
      </Card>
    </div>
  );
};

export default ActiveChatInput;
