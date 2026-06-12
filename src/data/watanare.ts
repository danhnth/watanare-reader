export interface WatanareVolumeData {
  id: string;
  volumeNumber: string;
  title: string;
  releaseDateJP: string;
  releaseDateEN: string;
  isbn: string;
  coverImage: string;
  synopsis: string;
  chapters: string[];
  epubSource?: string;
  inProgress?: boolean;
  translationProgress?: number;
  tag?: string;
}

export const watanareVolumes: WatanareVolumeData[] = [
  {
    id: "watanare-v1",
    volumeNumber: "1",
    title: "Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) - Tập 1",
    releaseDateJP: "21 tháng 2 năm 2020",
    releaseDateEN: "March 21, 2023",
    isbn: "978-4-08-631356-8",
    coverImage: "/images/books/watanare-v1/cover.webp",
    synopsis: "“Không bao giờ quay lại làm kẻ cô độc nữa! Phải giành lấy một đời sống cấp ba tuyệt vời!” Sau khi vứt bỏ quá khứ cô đơn thời trung học cơ sở, tôi - Amaori Renako - quyết định 'lột xác' khi bước vào cấp ba. Nhưng vì bản chất vốn là một cô nàng hướng nội, tôi lại khó hòa nhập với cuộc sống rực rỡ mà mình hằng ao ước, đến mức gần như ngộp thở! Trong lúc ấy, tôi tình cờ chia sẻ nỗi lòng với siêu sao của trường - Ouzuka Mai - và cả hai trở thành bạn bè bí mật. Tôi đã nghĩ rằng chỉ cần có Mai bên cạnh, mỗi ngày đều sẽ cố gắng được thôi… nhưng rồi! “Tớ đã lỡ yêu cậu mất rồi” “Khoan đã! Bạn bè đâu mất tiêu rồi” Một mối quan hệ tình nhân bất ổn như thế, tôi không thể chịu nổi! Điều tôi muốn là có một người bạn thân thật sự để tận hưởng tuổi học trò. Thế nhưng Mai lại chẳng thể từ bỏ tình cảm của mình… “Vậy thì hãy quyết định bằng một cuộc thi xem chúng ta hợp làm người yêu hay bạn thân hơn”. Thế là, một câu chuyện tình hài hước, sôi động, đặt cược vào cách tồn tại của cả hai đã chính thức bắt đầu!",
    epubSource: "/books/watanare-bilingual/Volume 01.epub",
    chapters: [
      "Minh họa",
      "Lời mở đầu",
      "Chương 1: Người yêu ấy hả, tuyệt đối không thể nào!",
      "Chương 2: Nụ hôn đầu đời á, tuyệt đối không thể nào!",
      "Chương 3: Bị ép thì tuyệt đối không chịu đâu!",
      "Chương 4: Bên cạnh Mai sao, quả nhiên là không được mà! (*Mà hình như được á)",
      "Lời kết"
    ]
  },
  {
    id: "watanare-v2",
    volumeNumber: "2",
    title: "Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) - Tập 2",
    releaseDateJP: "25 tháng 8 năm 2020",
    releaseDateEN: "July 18, 2023",
    isbn: "978-4-08-631379-7",
    coverImage: "/images/books/watanare-v2/cover.webp",
    synopsis: "Sau khi hạ cánh vào mối quan hệ ‘rema-fure’ (nửa bạn nửa tình), tôi và Mai quyết định sẽ dành trọn ba năm cấp ba để từ từ xác định xem chúng tôi hợp làm người yêu hay bạn thân hơn. Tôi bắt đầu cảm thấy mình cũng đã quen dần với cuộc sống cấp ba lấp lánh… cho đến một ngày: “Này, Amaori—cậu có thể hẹn hò với tớ không?” Người vừa bất ngờ tỏ tình lại chính là mỹ nhân tóc đen trong nhóm, Koto Satsuki! Nhưng tất nhiên, chuyện này không đơn giản. Thực ra, Satsuki muốn lợi dụng tôi để trả thù Mai. Kế hoạch của Satsuki khiến tôi rơi vào hàng loạt tình huống: từ hẹn hò sau giờ học, đến đi chơi qua đêm, thậm chí là cả nụ hôn!? Bị kẹp giữa hai đại mỹ nhân của trường Ashigaya, mỗi ngày tôi đều chạm đến giới hạn của bản thân!",
    epubSource: "/books/watanare-bilingual/Volume 02.epub",
    chapters: [
      "Minh họa",
      "Lời mở đầu",
      "Chương 1: Người yêu gì đó, tuyệt đối không thể! Phiên bản Satsuki",
      "Chương 2: Quá nhiều bí mật chỉ của hai ta, chịu hết nổi rồi!",
      "Chương 3: Tình thế tranh giành hay gì đó, dù có vùng vẫy thế nào cũng đành bó tay!",
      "Đánh bại hoàn toàn Mai và Satsuki ư, không thể nào đâu (※hình như được á)",
      "Lời kết",
      "Lời kết (tiếp theo)"
    ]
  },
  {
    id: "watanare-v3",
    volumeNumber: "3",
    title: "Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) - Tập 3",
    releaseDateJP: "23 tháng 4 năm 2021",
    releaseDateEN: "November 21, 2023",
    isbn: "978-4-08-631412-1",
    coverImage: "/images/books/watanare-v3/cover.webp",
    synopsis: "“Tớ đã quyết định bỏ nhà đi bụi!” Mọi chuyện bắt đầu từ câu nói ấy. Trong kỳ nghỉ hè, Ajisai cãi nhau với gia đình và bướng bỉnh tuyên bố sẽ bỏ nhà đi! Lo lắng vì chuyến đi một mình quá nguy hiểm, tôi đã vội vàng đồng hành cùng cô ấy. Tôi sẽ bảo vệ thiên thần này! Chúng tôi nghỉ lại ở thị trấn ven biển, chơi bóng bàn, tắm suối nước nóng, Ajisai còn trở nên như một cô em gái hay nũng nịu!? Rồi cả Mai cũng xuất hiện, khiến chuyến đi trở nên náo nhiệt hơn. Ajisai sau đó đã lấy lại tinh thần và hòa giải với gia đình, tưởng chừng mọi chuyện đã kết thúc. Nhưng tôi lại không hề nhận ra: Ajisai đã mang trong lòng những cảm xúc thế nào khi ở bên tôi.",
    epubSource: "/books/watanare/Volume 03.epub",
    inProgress: true,
    translationProgress: 0,
    chapters: [
      "Minh họa",
      "Prologue",
      "Prologue: The Sena Ajisaide of the Story",
      "Chapter 1: There's No Freaking Way I Can Visit Ajisai-san's House!",
      "Chapter 1: The Sena Ajisaide of the Story",
      "Chapter 2: There's No Freaking Way I Can Take a Vacation Alone with Ajisai-san! Unless...",
      "Chapter 2: The Sena Ajisaide of the Story",
      "Chapter 3: There's No Freaking Way We Can Stay Like This Forever!",
      "Chapter 3: The Sena Ajisaide of the Story",
      "Chapter 4: There's No Freaking Way Summer's Over Already!",
      "Chapter 4: The Sena Ajisaide of the Story",
      "Epilogue",
      "Epilogue: The Sena Ajisaide of the Story",
      "Afterword/Creator Bios/Newsletter"
    ]
  },
  {
    id: "watanare-v4",
    volumeNumber: "4",
    title: "Không đời nào tớ làm người yêu cậu đâu, điều đó là không thể! (※Nhưng điều đó đâu phải là không thể!?) - Tập 4",
    releaseDateJP: "25 tháng 10 năm 2021",
    releaseDateEN: "March 19, 2024",
    isbn: "978-4-08-631439-8",
    coverImage: "/images/books/watanare-v4/cover.webp",
    synopsis: "“Cậu có thể cho tớ thêm thời gian không…?” Kỳ nghỉ hè, Ajisai đã tỏ tình với tôi, và tôi chỉ có thể đáp lại như vậy. Bị bủa vây bởi tình cảm từ cả Mai và Ajisai, tôi dần cảm thấy ngột ngạt, không biết phải trả lời thế nào. Trong lúc ấy, tôi tình cờ giúp Kaho với sở thích cosplay và chụp ảnh. Nào là mặc những bộ trang phục dễ thương để chụp hình, được tiếp thêm tự tin nhờ ASMR do Kaho tự tay làm, rồi cả buổi tiệc kết thúc lại dẫn đến việc vào khách sạn tình nhân. Giữa những ngày bận rộn ấy, tôi tưởng rằng mình có thể quên đi những trăn trở… nhưng không hề. Mai, Ajisai, Satsuki, và cả Kaho. Nhờ cuộc sống cấp ba mới mà tôi đã gặp được họ, và giờ đây tôi phải đưa ra câu trả lời chỉ mình tôi có thể.",
    epubSource: "/books/watanare/Volume 04.epub",
    inProgress: true,
    translationProgress: 0,
    chapters: [
      "Prologue",
      "Chapter 1: There's No Freaking Way I Can Be Buddy-Buddy with Kaho-chan!",
      "Chapter 2: There's No Freaking Way I Can Do My First Cosplay!",
      "Chapter 3: There's No Freaking Way I Can Do This Performance! Unless...",
      "Minaguchi Kaho's Story",
      "Chapter 4: There's No Freaking Way We Can Stay Like This Forever, Right?",
      "Chapter 5 Preface: Otherwise Known as Mai's Side of the Story",
      "Chapter 6: There's No Freaking Way I'll Be Your Lover! Unless...",
      "Epilogue",
      "Intermission: Satsuki and Amaori 2"
    ]
  }
];

export const watanareSideStories: WatanareVolumeData[] = [];

export const watanareMetadata = {
  title: "There's No Freaking Way I'll be Your Lover! Unless...",
  japaneseTitle: "わたしが恋人になれるわけないじゃん、ムリムリ！（※ムリじゃなかった!?）",
  author: "	Mikami Teren",
  illustrator: "Takeshima Eku",
  genre: ["Yuri", "Rom-com", "Đời thường"],
  synopsis: "Renako Amaori chỉ mong có một cuộc sống trung học yên bình, bình thường. Nhưng khi Mai Ouzuka - cô gái xinh đẹp và nổi tiếng - tuyên bố rằng cả hai sẽ trở thành “người yêu” trong một thí nghiệm xã hội, thế giới của Renako lập tức đảo lộn. Từ một mối quan hệ giả tạo, mọi thứ nhanh chóng xoay chuyển thành những cảm xúc thật sự, những hiểu lầm, và sự hỗn loạn ngọt ngào đầy rung động của mối tình đầu..",
  quote: "Tôi chỉ là một nhân vật nền thôi! Tôi đâu có được định sẵn để trở thành nhân vật chính trong một bộ phim Rom-com chứ!",
  quoteAttribution: "Amaori Renako",
  totalVolumes: 4,
  status: "Ongoing"
};
