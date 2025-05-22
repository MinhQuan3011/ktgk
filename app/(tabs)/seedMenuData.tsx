import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

const sampleData: MenuItem[] = [
  {
    id: "1",
    name: "Lẩu Tứ Xuyên",
    price: 120000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840039/lautuxuyenn_vcfpsy.jpg",
    category: "chinese", // viết thường
  },
  {
    id: "2",
    name: "Đậu Hủ",
    price: 60000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840039/dauhu_mhapuq.jpg",
    category: "chinese",
  },
  {
    id: "3",
    name: "Há Cảo",
    price: 50000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840039/hacao_vgw5rv.jpg",
    category: "chinese",
  },
  {
    id: "4",
    name: "Vịt quay Bắc Kinh",
    price: 150000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840038/vitquaybackinh_b3k88z.jpg",
    category: "chinese",
  },
  {
    id: "5",
    name: "Mì trường thọ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840038/mytruongtho_xbziq6.jpg",
    category: "chinese",
  },
  {
    id: "6",
    name: "Phật nhảy tường",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840038/phatnhaytuong_nt5ymh.jpg",
    category: "chinese",
  },  

  {
    id: "7",
    name: "Chân gà cay",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840039/changacay_xg4vrf.jpg",
    category: "chinese",
  },
  {
    id: "8",
    name: "Cơm chiên Dương Châu",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840038/comchienduongchau_zhh2hx.jpg",
    category: "chinese",
  },
  {
    id: "9",
    name: "Bánh bao Kim Sa",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840038/banhbaokimsa_dv3sw1.jpg",
    category: "chinese",
  },
  {
    id: "10",
    name: "Tôm sào hạt điều",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747840038/tomsaohatdieu_se5jtj.jpg",
    category: "chinese",
  },

  {
    id: "11",
    name: "Sushi",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841073/Sushi_lxi7th.jpg",
    category: "japan",
  },

  {
    id: "12",
    name: "Sashimi",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841072/Sashimi_d9q5lq.jpg",
    category: "japan",
  },

  {
    id: "13",
    name: "Tempura",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841071/tempura_my9qey.jpg",
    category: "japan",
  },

  {
    id: "14",
    name: "Súp miso",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841071/Supmiso_rwgzyg.jpg",
    category: "japan",
  },

  {
    id: "15",
    name: "Cơm nắm onigiri",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841070/Comnam_onigiri_w7dhuu.jpg",
    category: "japan",
  },

  {
    id: "16",
    name: "Mì udon",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841069/MiUdon_kmhzrg.jpg",
    category: "japan",
  },

  {
    id: "17",
    name: "Mì soba",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841068/Misoba_lzrpze.jpg",
    category: "japan",
  },

  {
    id: "18",
    name: "Mì Ramen",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841067/Miramen_auzqey.jpg",
    category: "japan",
  },


  {
    id: "19",
    name: "Cơm cà ri",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841067/Comcari_jxiq2o.jpg",
    category: "japan",
  },

  {
    id: "20",
    name: "Cơm trộn trứng sống",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841066/Comtrontrungsong_vs9ekx.jpg",
    category: "japan",
  },

  {
    id: "21",
    name: "Donburi",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841065/Donburi_dixywn.jpg",
    category: "japan",
  },

  {
    id: "22",
    name: "Natto",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841065/Natto_hjkv0x.jpg",
    category: "japan",
  },

  {
    id: "23",
    name: "Umeboshi",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841064/Umeboshi_bwqp43.jpg",
    category: "japan",
  },

  {
    id: "24",
    name: "Takuwan",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841063/Takuwan_wtgqo4.jpg",
    category: "japan",
  },

  {
    id: "25",
    name: "Sukiyaki",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841062/Sukiyaki_yomfcg.jpg",
    category: "japan",
  },

  {
    id: "26",
    name: "Lẩu shabu-shabu",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841062/Shabu_Shau_vskxcc.jpg",
    category: "japan",
  },

  {
    id: "27",
    name: "Đồ chiên karage",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841062/Karaage_azqdil.jpg",
    category: "japan",
  },

  {
    id: "28",
    name: "Thịt nướng Yakiniku",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841061/Yakiniku_nlregr.jpg",
    category: "japan",
  },

  {
    id: "29",
    name: "Bánh gạo khô",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841061/Senbei_fipmrz.jpg",
    category: "japan",
  },

  {
    id: "30",
    name: "Takoyaki",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747841061/Takoyaki_jb6xvg.jpg",
    category: "japan",
  },

  //Vietnam
    {
    id: "31",
    name: "Bánh mì thịt nướng",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842932/banhmithitnuong_htt6km.jpg",
    category: "vietnam",
  },

    {
    id: "32",
    name: "Bánh cuốn",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842931/banhcuon_uofost.jpg",
    category: "vietnam",
  },
    {
    id: "33",
    name: "Phở bò",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842929/phobo_ais8c8.jpg",
    category: "vietnam",
  },
    {
    id: "34",
    name: "Bún riêu cua",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842929/bunrieucua_logf4l.jpg",
    category: "vietnam",
  },
    {
    id: "35",
    name: "Bún chả",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842928/buncha_mgeqqr.jpg",
    category: "vietnam",
  },
    {
    id: "36",
    name: "Bánh bao",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842927/banhbao_fo6bt6.jpg",
    category: "vietnam",
  },
    {
    id: "37",
    name: "Bún bò Huế",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842926/bunbohue_oxba7r.jpg",
    category: "vietnam",
  },
    {
    id: "38",
    name: "Xôi",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842925/xoi_kpibqd.jpg",
    category: "vietnam",
  },
    {
    id: "39",
    name: "Mì Quảng",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842924/miquang_qxbhbu.jpg",
    category: "vietnam",
  },
    {
    id: "40",
    name: "Hủ tiếu Nam Vang",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842923/hutieunamvang_flq4uf.jpg",
    category: "vietnam",
  },
    {
    id: "41",
    name: "Cơm tấm",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842922/comtam_useiwb.jpg",
    category: "vietnam",
  },
    {
    id: "42",
    name: "Sườn xào",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842922/suonsao_rzfale.jpg",
    category: "vietnam",
  },
    {
    id: "43",
    name: "Nộm hoa chuối",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842921/nomhoachuoi_x3uzaa.jpg",
    category: "vietnam",
  },
    {
    id: "44",
    name: "Canh chua cá lóc",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842920/canhchuacaloc_l6laeg.jpg",
    category: "vietnam",
  },
    {
    id: "45",
    name: "Gỏi cuốn",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842919/goicuon_yk53un.jpg",
    category: "vietnam",
  },
    {
    id: "46",
    name: "Bò xào rau củ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842918/boxaoraucu_axby9x.jpg",
    category: "vietnam",
  },
    {
    id: "47",
    name: "Chả cá",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842917/chaca_quchys.jpg",
    category: "vietnam",
  },
    {
    id: "48",
    name: "Cà ri gà cay",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842916/carigacay_ioaspk.jpg",
    category: "vietnam",
  },
    {
    id: "49",
    name: "Cá kho",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842915/cakho_kdyi0a.jpg",
    category: "vietnam",
  },
    {
    id: "50",
    name: "Cao lầu",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842915/caulau_sdiett.jpg",
    category: "vietnam",
  },
    {
    id: "51",
    name: "Cá chiên ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842914/cachienchamnuocmam_zuq8wr.jpg",
    category: "vietnam",
  },
    {
    id: "52",
    name: "Nem rán giòn rụm ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842913/nemrangionrum_tloe3t.jpg",
    category: "vietnam",
  },
    {
    id: "53",
    name: "Bánh xèo",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842913/banhxeo_hdxgrr.jpg",
    category: "vietnam",
  },
    {
    id: "54",
    name: "Sữa chua",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842913/suachua_a68aoj.jpg",
    category: "vietnam",
  },
    {
    id: "55",
    name: "Bánh Flan/ Caramen",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747842912/banhflancaramen_mezfxx.jpg",
    category: "vietnam",
  },
  //korea
    {
    id: "56",
    name: "Mì lạnh Naengmyeon",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843961/milanh_xrwfev.jpg",
    category: "korea",
  },

     {
    id: "57",
    name: "Lòng nướng Gopchang",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747844621/mongopchang_cnm7hu.jpg",
    category: "korea",
  },
     {
    id: "58",
    name: "Dồi huyết Sundae ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843961/doihuyet_tjfc7t.jpg",
    category: "korea",
  },

     {
    id: "59",
    name: "Ba chỉ heo nướng Samgyeopsal ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843960/bachiheo_injmrp.jpg",
    category: "korea",
  },

   {
    id: "60",
    name: "Súp xương bò hầm Seolleongtang ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843960/seolleong_aaa0k0.jpg",
    category: "korea",
  },

     {
    id: "61",
    name: "Mì đậu nành lạnh Kongguksu ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843928/midaunah_r30ljt.jpg",
    category: "korea",
  },

     {
    id: "62",
    name: "Thịt lươn nướng JangEo Gui ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843877/jangeo_lgk5tb.jpg",
    category: "korea",
  },

     {
    id: "63",
    name: " Bánh xèo hải sản Haemul Pajeon",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843822/banhxeohaisan_wyrr4s.jpg",
    category: "korea",
  },


     {
    id: "64",
    name: "Bibimbap (Cơm trộn Hàn Quốc) ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843821/comtron_swhm19.jpg",
    category: "korea",
  },

     {
    id: "65",
    name: "Tteokbokki (Bánh gạo cay)",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747843821/banhgaocay_x1krir.jpg",
    category: "korea",
  },
  // drink
     {
    id: "66",
    name: "Cookie Cream",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890652/CookieCream_su8ooe.jpg",
    category: "drink",
  },

     {
    id: "67",
    name: "Sữa tươi trân châu đường đen",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890653/suatuoichantrauduongden_riidng.jpg",
    category: "drink",
  },

     {
    id: "68",
    name: "Trà phô mai kem sữa ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890652/traphomaikemsua_k7om4w.jpg",
    category: "drink",
  },

     {
    id: "69",
    name: "Trà hoa quả",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890652/trahoaqua_wa2pl6.jpg",
    category: "drink",
  },

     {
    id: "70",
    name: "Trà đào chanh sả",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890651/tracamsa_flybqz.jpg",
    category: "drink",
  },
     {
    id: "71",
    name: "Socola đá xay",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890652/socoladaxay_wqjcjw.jpg",
    category: "drink",
  },

      {
    id: "72",
    name: "Melon Soda",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890651/Melon-Soda_afmnae.jpg",
    category: "drink",
  },

      {
    id: "73",
    name: "Trà xanh Matcha",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890652/douongnhatbanmatcha_k0cfmf.jpg",
    category: "drink",
  },

      {
    id: "74",
    name: "Japanese Yogurt Drink",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890651/Japanese_Yogurt_Drink_nzh5av.jpg",
    category: "drink",
  },

      {
    id: "75",
    name: "Ramune",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747890652/douongnhatbanramune_vm5kpr.jpg",
    category: "drink",
  },

       {
    id: "76",
    name: "Pocari Sweat",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747891168/Pocari-Sweat_mtkhcy.jpg",
    category: "drink",
  },

       {
    id: "77",
    name: " Calpis",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747891168/calpis_1_gyiksp.jpg",
    category: "drink",
  },

       {
    id: "78",
    name: "Mugicha",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747891168/mujicha_q04dvi.jpg",
    category: "drink",
  },

       {
    id: "79",
    name: "Genmaicha",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747891167/genmaicha_artqbd.jpg",
    category: "drink",
  },


       {
    id: "80",
    name: "Sakurayu",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747891167/Sakura-Yu_xjdg9n.jpg",
    category: "drink",
  },
  
  //Rice 
      {
    id: "81",
    name: "Cơm Chiên Nấm Hương Trứng Gà",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892190/comchiennamhuong_hnlala.webp",
    category: "rice",
  },
  

      {
    id: "82",
    name: "Cơm Chiên Tôm Trứng",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892189/comchientrung_lddf80.webp",
    category: "rice",
  },
  
      {
    id: "83",
    name: "Cơm Rang Mắm Tỏi Mỡ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892189/c%E1%BB%8Fmangmamtoi_xvxgqr.webp",
    category: "rice",
  },
  


      {
    id: "84",
    name: "Cơm rang trứng",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892188/comrangtrung_argq6n.webp",
    category: "rice",
  },
  

      {
    id: "85",
    name: "Cơm chiên thập cẩm",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892187/comchienthapcam_ocemgj.webp",
    category: "rice",
  },
  

      {
    id: "86",
    name: "Cơm cuộn trang trí lá cờ Việt Nam",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892186/c%C6%A1m-cu%E1%BB%99n-trang-tri-la-c%E1%BB%9D-vi%E1%BB%87t-nam_yrae5e.webp",
    category: "rice",
  },
  

      {
    id: "87",
    name: "Cơm Tấm Đêm",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892186/comtamdem_cbbyll.webp",
    category: "rice",
  },
  

      {
    id: "88",
    name: "Cơm trộn theo sở thích kèm canh đậu phụ cải thảo",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747893124/comcaithao_idebns.webp",
    category: "rice",
  },
  

      {
    id: "89",
    name: "Cơm Trộn Thập Cẩm",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892185/comtronthapcam_lutejy.webp",
    category: "rice",
  },
  

      {
    id: "90",
    name: "Cơm cuộn thịt vai nướng",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892184/comcuonthichvainuong_xewsqb.webp",
    category: "rice",
  },
  

      {
    id: "91",
    name: "Cơm chiên cà ri nấm hầu thủ",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892183/comchiencarinamhauthu_phnyiq.webp",
    category: "rice",
  },
  

      {
    id: "92",
    name: "Cơm thịt nướng",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892183/comthitnuong_evdifz.webp",
    category: "rice",
  },
  
      {
    id: "93",
    name: "Cơm chiên ngọc bích",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892183/comchienngocbich_kqkkac.webp",
    category: "rice",
  },
  

      {
    id: "94",
    name: "Cơm chiên trứng xúc xích",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892182/comchientrungxucxich_ru9xln.webp",
    category: "rice",
  },
  

      {
    id: "95",
    name: "Cơm Chiên Lạp Xưởng Tôm Trứng",
    price: 90000,
    image: "https://res.cloudinary.com/dub6szgve/image/upload/v1747892183/comchienlapxuongtomtrung_cltrrq.webp",
    category: "rice",
  },
  

];


export const seedMenuData = async () => {
  try {
    const uploadPromises = sampleData.map((item) => {
      const docRef = doc(db, "menu", item.id);
      return setDoc(docRef, item);
    });

    await Promise.all(uploadPromises);
    console.log("✅ Sample menu data uploaded to Firestore.");
  } catch (error) {
    console.error("❌ Failed to upload sample data:", error);
  }
};

