export default function MapSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold uppercase text-sm tracking-wide">Location</span>
          <h2 className="text-section font-display font-bold mt-2 text-foreground">मानचित्र पर हमारा स्थान देखें</h2>
          <p className="text-muted-foreground mt-2">ग्राम – नौहर, पोस्ट – ग्वालपारा, जिला – मधेपुरा, बिहार, (भारत)</p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-card ring-1 ring-border aspect-video">
          <iframe
            title="Nohar Village Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14371.54!2d86.78!3d25.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDU1JzEyLjAiTiA4NsKwNDYnNDguMCJF!5e0!3m2!1sen!2sin!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
