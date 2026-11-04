import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqAccordion({ items }) {
  const [openId, setOpenId] = useState(items[0]?.id || null);

  return (
    <div className="faq-list">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <article key={item.id} className={`faq-item ${open ? 'is-open' : ''}`.trim()}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`faq-answer-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span>{item.question}</span>
                <ChevronDown size={20} aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-answer-${item.id}`} className="faq-item__answer" hidden={!open}>
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
