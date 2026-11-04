import { Quote, Star } from 'lucide-react';
import { resolveAssetUrl } from '../services/api';

export function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card">
      <Quote size={28} className="testimonial-card__quote" aria-hidden="true" />
      <div className="stars" aria-label={`${testimonial.rating} / 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={16}
            aria-hidden="true"
            fill={index < testimonial.rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      <blockquote>{testimonial.text}</blockquote>
      <footer>
        <img
          src={resolveAssetUrl(testimonial.photo)}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/logo.svg';
          }}
        />
        <strong>{testimonial.author}</strong>
      </footer>
    </article>
  );
}
