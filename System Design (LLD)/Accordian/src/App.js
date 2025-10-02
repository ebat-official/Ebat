import React from "react";
import Accordian from "./Accordian";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          FAQ Accordion Component
        </h1>
        
        <div className="space-y-4">
          <Accordian>
            <Accordian.Title>
              <h3 className="text-lg font-semibold text-gray-800">
                What is React?
              </h3>
            </Accordian.Title>
            <Accordian.Content>
              <p className="text-gray-600 leading-relaxed">
                React is a JavaScript library for building user interfaces, particularly web applications. 
                It was created by Facebook and is now maintained by Facebook and the community. 
                React allows developers to create reusable UI components and manage the state of their applications efficiently.
              </p>
            </Accordian.Content>
          </Accordian>

          <Accordian>
            <Accordian.Title>
              <h3 className="text-lg font-semibold text-gray-800">
                How does the Accordion component work?
              </h3>
            </Accordian.Title>
            <Accordian.Content>
              <p className="text-gray-600 leading-relaxed">
                This accordion component uses React Context to manage state between the title and content components. 
                It features smooth animations, keyboard accessibility, and a clean, modern design. 
                The component is built with Tailwind CSS for styling and includes hover effects and focus states.
              </p>
            </Accordian.Content>
          </Accordian>

          <Accordian>
            <Accordian.Title>
              <h3 className="text-lg font-semibold text-gray-800">
                What are the key features of this accordion?
              </h3>
            </Accordian.Title>
            <Accordian.Content>
              <ul className="text-gray-600 leading-relaxed space-y-2">
                <li>• Smooth expand/collapse animations</li>
                <li>• Keyboard accessibility (Enter and Space keys)</li>
                <li>• Hover and focus states for better UX</li>
                <li>• Animated chevron icon that rotates</li>
                <li>• Clean, modern design with Tailwind CSS</li>
                <li>• Responsive and mobile-friendly</li>
              </ul>
            </Accordian.Content>
          </Accordian>

          <Accordian>
            <Accordian.Title>
              <h3 className="text-lg font-semibold text-gray-800">
                How to use this component?
              </h3>
            </Accordian.Title>
            <Accordian.Content>
              <div className="text-gray-600 leading-relaxed">
                <p className="mb-3">Simply import and use the component like this:</p>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<Accordian>
  <Accordian.Title>
    <h3>Your Title Here</h3>
  </Accordian.Title>
  <Accordian.Content>
    <p>Your content here</p>
  </Accordian.Content>
</Accordian>`}
                </pre>
              </div>
            </Accordian.Content>
          </Accordian>

          <Accordian>
            <Accordian.Title>
              <h3 className="text-lg font-semibold text-gray-800">
                Can I customize the styling?
              </h3>
            </Accordian.Title>
            <Accordian.Content>
              <p className="text-gray-600 leading-relaxed">
                Yes! You can pass a className prop to the main Accordian component to add custom styling. 
                The component is built with Tailwind CSS, so you can easily override styles or add additional classes. 
                All the internal styling uses Tailwind utility classes that can be customized as needed.
              </p>
            </Accordian.Content>
          </Accordian>
        </div>
      </div>
    </div>
  );
}

export default App;
