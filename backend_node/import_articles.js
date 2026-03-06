import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const articles = [
  {
    "title": "The Gospel Story: Why Your Work Matters",
    "description": "Picture the slice of toast you had for breakfast this morning. How did it get to your table? Farmers tilled the soil, companies produced fertilizers, and logistics teams transported…",
    "url": "https://redeemercitytocity.com/articles-stories/the-gospel-story-why-your-work-matters",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1751384096503-WMQU4L4OF07N4YWEK4RO/dibakar-roy-CaXvurXMJ0g-unsplash.jpg",
    "author": "GOSPEL CITY NETWORK",
    "category": "Faith and Work"
  },
  {
    "title": "The Outward Look and Feel of Humility",
    "description": "By all accounts, humility ranks as one of the most important virtues of the Christian life. In his classic book Humility: The Beauty of Holiness, Andrew Murray famously…",
    "url": "https://redeemercitytocity.com/articles-stories/the-outward-look-and-feel-of-humility",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1707330112503-MQKU3WWCA5S8HUGAQZ6X/victor-grabarczyk-0YZWBH2z34M-unsplash.jpg",
    "author": "ABRAHAM CHO",
    "category": "Faith and Work"
  },
  {
    "title": "Marketplace Ministry and the Church",
    "description": "After completing my engineering degree, I responded to God’s call to become a pastor. The first eight years…",
    "url": "https://redeemercitytocity.com/articles-stories/marketplace-ministry-and-the-church",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1700502643090-GW3ECL4KEW0RTS4R53N4/pieter-van-noorden-yQ9NNBelr0Y-unsplash.jpg",
    "author": "SIBS SIBANDA",
    "category": "Faith and Work"
  },
  {
    "title": "One Easy Thing\" to Help Pastors Engage Their Audience",
    "description": "Pastors, finding one topic your congregation can identify with is usually pretty simple—it’s their work. But how often do you talk about their careers from the pulpit? Despite clear data that…",
    "url": "https://redeemercitytocity.com/articles-stories/one-easy-thing-to-help-pastors-engage-their-audience",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1657216937533-5JJ3FKTPV5J86YKVZC9S/calle-macarone-D7rdbx8w6Og-unsplash.jpeg",
    "author": "MISSY WALLACE",
    "category": "Faith and Work"
  },
  {
    "title": "A Holistic Understanding of Creative Goodness in the Workplace",
    "description": "They found what they say is the single largest finding in the history of Gallup—that people care more about work than anything else…",
    "url": "https://redeemercitytocity.com/articles-stories/a-holistic-understanding-of-creative-goodness-in-the-workplace",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1638935236609-DQYJJAXWEYOJJD6KKH01/unsplash-image-YI_9SivVt_s.jpg",
    "author": "MISSY WALLACE",
    "category": "Faith and Work"
  },
  {
    "title": "The Complex Idolatries of Africa",
    "description": "This discussion is premised on two basic ideas about African society. The first is this: unlike Western society, which Tim Keller observes has rejected the idea of a “sacred order,” the African conception…",
    "url": "https://redeemercitytocity.com/articles-stories/an-african-perspective-on-how-to-reach-the-west-again",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1583255248764-KDSOOMFM2ZISKNFOOHA7/_DSC6463.jpg",
    "author": "SIBS SIBANDA",
    "category": "Faith and Work"
  },
  {
    "title": "Three Simple Principles of Faith and Work",
    "description": "It was not my intention as a pastor to spend a lot of time thinking about the intersection of faith and work. However, what I fell into has now become a firm conviction about discipleship…",
    "url": "https://redeemercitytocity.com/articles-stories/three-simple-principles-of-faith-and-work",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1574116423119-G1X44UQG2QAV89SOR1TC/scaffolding-blog.jpg",
    "author": "MATT ARONEY",
    "category": "Faith and Work"
  },
  {
    "title": "It Was God All Along",
    "description": "You never know when God is going to use something as small as an email to change your life forever. I grew up in Eastern Germany. I was seventeen when the Berlin Wall came down…",
    "url": "https://redeemercitytocity.com/articles-stories/it-was-god-all-along",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1572988456356-F0R0R44BD1MXBCPB06KT/hamburg-1-crop.jpg",
    "author": "ANKE STEINBACH",
    "category": "Faith and Work"
  },
  {
    "title": "Your Vocation is Bigger Than Your Job",
    "description": "“Is who I am merely what I do?” We sat in a coffee shop taking stock of the past decade. I met Kurt as a promising PhD student at Cal-Berkeley, and now…",
    "url": "https://redeemercitytocity.com/articles-stories/your-vocation-is-bigger-than-your-job",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1568233780963-QPQSR8FY2UAKPXCYOM9W/vocation-1.jpeg",
    "author": "BART GARRETT",
    "category": "Faith and Work"
  },
  {
    "title": "Shaping an Imagination for Faith and Work: An Interview with Russell Joyce",
    "description": "Integrating faith and work is rarely a priority in the early stages of church planting. However, Russell Joyce and his team at Hope Brooklyn have been intentional about…",
    "url": "https://redeemercitytocity.com/articles-stories/shaping-an-imagination-for-faith-and-work-an-interview-with-russell-joyce",
    "image_url": "https://images.squarespace-cdn.com/content/v1/5d44636cd5f86700012df925/1568032066948-CTXF70V9RC378CQY0I6T/1_L1eAL2tDXvtjwLRE5s4umg.jpeg",
    "author": "CITY TO CITY",
    "category": "Faith and Work"
  }
];

async function main() {
  console.log('Starting import...');
  for (const article of articles) {
    await prisma.resources.create({
      data: {
        title: article.title,
        description: article.description,
        url: article.url,
        image_url: article.image_url,
        author: article.author,
        category: article.category,
        status: 'approved',
        submitted_by: 1 // Default to admin or first user
      }
    });
    console.log(`Imported: ${article.title}`);
  }
  console.log('Import complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
