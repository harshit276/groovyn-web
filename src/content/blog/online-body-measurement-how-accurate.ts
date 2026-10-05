import type { Post } from "@/lib/blog";

export const post: Post = {
  slug: "online-body-measurement-how-accurate",
  title: "Online Body Measurement: Can a Phone Really Measure You?",
  metaTitle: "Online Body Measurement: Is a Phone Scan Accurate?",
  description:
    "How phone body-measurement apps work, what limits their accuracy, what they cannot measure, and six questions to ask before you trust one with your tailor.",
  excerpt:
    "A plain explanation of how a phone turns two photos into a chest, waist and hip, where the errors come from, and how to judge any measurement app, including ours.",
  cluster: "measurements",
  datePublished: "2026-10-01T09:40:00+05:30",
  dateModified: "2026-10-01T09:40:00+05:30",
  primaryKeyword: "online body measurement",
  related: [
    "how-to-take-body-measurements-at-home",
    "how-to-measure-for-a-blouse-at-home",
    "how-to-choose-a-tailor-in-delhi",
  ],
  blocks: [
    {
      type: "p",
      text: "Point a phone at yourself, stand still for a few seconds, and get a chest, waist and hip measurement back. It sounds like a trick, and the marketing around it often makes it sound like magic. It is neither. It is a chain of fairly ordinary steps, each with a known way of going wrong. Understanding those steps tells you how far to trust the result, and what to do about the parts it cannot see.",
    },

    { type: "h2", text: "How a phone turns photos into measurements" },
    {
      type: "ol",
      items: [
        "**Find the body.** A pose-estimation model locates joints in the image: shoulders, elbows, wrists, hips, knees and ankles. That gives the skeleton and the proportions.",
        "**Cut out the silhouette.** A segmentation model marks which pixels are you and which are the wall behind. The outline of those pixels is what gets measured.",
        "**Scale it.** A photo has no built-in size, so the system needs one real-world reference. The usual one is your height, which you type in. Pixels per centimetre follows from how tall you are in the frame.",
        "**Turn widths into girths.** A front photo gives the width of the body at chest, waist and hip. A side photo gives the depth at the same levels. Treat each slice as an ellipse and its perimeter is the girth. Some systems go further and fit a 3D body model trained on body-scan data, which can infer shape a silhouette alone cannot show.",
        "**Take lengths from the joints.** Sleeve length follows the shoulder, elbow and wrist. Inseam and outseam run from the hip to the ankle.",
      ],
    },

    { type: "h2", text: "What limits the accuracy" },
    {
      type: "p",
      text: "Each step above adds a small error, and several of them have nothing to do with the software.",
    },
    {
      type: "table",
      caption: "What limits phone measurement accuracy",
      head: ["Source of error", "Why it matters", "What to do"],
      rows: [
        ["Loose clothing", "The silhouette is the clothes, not the body", "Wear something fitted: a thin t-shirt and leggings"],
        ["Wrong height", "Height is the scale. A 2 cm error moves chest and waist by about 1 cm", "Measure your height barefoot against a wall"],
        ["Shoes and hair", "They add pixels to your height without being part of your height", "Shoes off, long hair tied up"],
        ["Leaning or swaying", "A lean narrows every width, and movement blurs the edges", "Stand straight and still"],
        ["Arms in the silhouette", "An arm against the torso adds width that is not torso", "Hold arms clear of the body as instructed"],
        ["The elliptical assumption", "A real waist or bust is not an exact ellipse, so girths tend to read slightly under", "Treat results as estimates and let a tailor confirm"],
        ["Camera and lighting", "Distortion, a cluttered background or a dark room make the outline less certain", "Plain background, good light, phone upright at hip height"],
      ],
    },
    {
      type: "p",
      text: "A tailor cutting a suit works to roughly half a centimetre. Two tailors measuring the same person with a tape will often disagree by about a centimetre. Phone systems of this kind generally aim for errors of a few centimetres on chest, waist and hip, which is enough for a starting point and not enough to cut expensive fabric from.",
    },

    { type: "h2", text: "What a phone can and cannot measure" },
    {
      type: "p",
      text: "A silhouette can see the body's outline at a level. It cannot see small or hidden measurements, or anything that depends on feel.",
    },
    {
      type: "table",
      caption: "What our scan measures and what it leaves to a tape",
      head: ["Measured by the scan", "Left for a tape"],
      rows: [
        ["Chest or bust, waist, hip (girths)", "Neck, bicep, wrist and thigh (too small or hidden)"],
        ["Shoulder width", "Underbust and armhole (inside the silhouette)"],
        ["Sleeve length, inseam, outseam (from the joints)", "Kurta, shirt and blouse lengths (a choice, not a body part)"],
      ],
      note: "You type your height yourself. Nothing on the left is treated as final: every value can be edited before it is saved.",
    },

    { type: "h2", text: "Six questions to ask before you trust any measurement app" },
    {
      type: "ol",
      items: [
        "**Does it upload your photos?** Pictures of your body are about as personal as images get. Prefer an app that processes them on your device and says so clearly.",
        "**Does it publish its accuracy, with the method?** Look for errors stated in centimetres, compared against a tape, on a stated number of people. A claim like \"more accurate than a tailor\" with no method behind it is marketing, not evidence.",
        "**Does it tell you what it could not measure?** An honest system leaves neck and wrist blank instead of guessing them.",
        "**Does it reject a bad capture?** If it accepts you standing crooked, with your feet cut off or your arms against your body, it is producing numbers it cannot stand behind.",
        "**Can you edit the results?** You have a tape and it does not. The final number should be yours.",
        "**Does it say the estimate needs confirming?** For made-to-measure clothing, a tailor checking the numbers with a tape is the step that matters.",
      ],
    },

    { type: "h2", text: "How our measurement scan works, and what we have not proved" },
    {
      type: "p",
      text: "Our [free measurement scan](/measurements) follows the steps above. It runs in your browser: the camera is read on your phone, the frames are measured and discarded, and nothing is uploaded. The body model is downloaded to your device once. The measurements are saved on your device only, unless you choose to attach them to a booking, in which case the numbers are sent to that one shop and no image is.",
    },
    {
      type: "p",
      text: "It rejects a capture if your head or feet are cut off, if you are leaning or swaying, or if your arms are in the wrong place, and it speaks the instruction aloud so you can follow it from two or three metres away with your arms out. The geometry is tested against synthetic bodies with known dimensions, which checks the maths. **That is not a test on real people, and we have not yet published a validation study against tape measurements.** Until we do, treat every number as a starting point and let your tailor confirm it.",
    },

    { type: "h2", text: "Getting the best result from a scan" },
    {
      type: "ul",
      items: [
        "Take your shoes off, tie long hair up and wear something fitted.",
        "Prop the phone against a wall at about hip height, camera facing you, with a plain background and good light.",
        "Stand two to three metres away so your whole body fits, head to toe.",
        "Turn the sound on. The instructions are spoken, so you do not need to read the screen.",
        "Type your height accurately. It matters more than any other number you enter.",
        "Scan twice and compare. If the two results differ by more than a couple of centimetres, trust neither and use a tape.",
      ],
    },
    { type: "cta", kind: "measure" },

    {
      type: "p",
      text: "If you would rather use a tape, our guide to [taking body measurements at home](/blog/how-to-take-body-measurements-at-home) walks through every measurement, and the [blouse](/blog/how-to-measure-for-a-blouse-at-home) guide covers the ones specific to women's wear. Whichever way you get your numbers, [choose a tailor carefully](/blog/how-to-choose-a-tailor-in-delhi) and ask for a trial fitting.",
    },
  ],
  faq: [
    {
      q: "Is the measurement scan free?",
      a: "Yes. There is nothing to pay and no account to create, and it runs entirely in your browser, so any modern phone with a camera and an internet connection can use it.",
    },
    {
      q: "Are my photos uploaded?",
      a: "No. The camera is read on your phone and the frames are discarded after they are measured. The body-model file is downloaded to your browser once. Saved measurements stay on your device unless you attach them to a booking, which sends the numbers to that shop and no image.",
    },
    {
      q: "Does it work for both men and women?",
      a: "Yes. The scan is the same for everyone. You choose a women's or men's chart, which decides which measurements are listed, for example underbust on the women's chart, and which proportions are used for the starting values if you enter measurements by hand.",
    },
    {
      q: "How accurate is a phone body scan?",
      a: "It depends on the system, your clothes and how well you hold the pose. Systems of this kind generally aim for errors of a few centimetres on chest, waist and hip, while a tailor works to about half a centimetre. We have not yet validated ours against tape measurements on real people, so treat the result as a starting point for your tailor to confirm.",
    },
    {
      q: "Why does it ask for my height?",
      a: "Your height is the only reference the camera has for turning pixels into centimetres. A 2 cm error in height shifts your girths by about 1 cm, so it is worth measuring properly.",
    },
    {
      q: "Can I have clothes made from these measurements?",
      a: "Use them to brief a tailor or to compare quotes, and have the tailor confirm them with a tape before cutting expensive fabric. For structured garments like suits and bridal blouses, ask for trial fittings as well.",
    },
  ],
};
