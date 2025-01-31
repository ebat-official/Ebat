import { Facebook } from 'next-auth/providers/facebook';
import {
    FaAmazon, FaGoogle,FaBuilding, FaMicrosoft, FaApple, FaFacebook,  FaSalesforce, FaPaypal, FaDocker, FaAtlassian, FaBitbucket, FaGithub, FaGitlab, FaSlack, FaDropbox, FaTrello, FaShopify, FaWordpress,
    FaStripe
  } from "react-icons/fa";
  
  import {
    SiFlipkart, SiTata, SiInfosys, SiWipro, SiHcl, SiZoho, SiSamsung, SiNvidia, SiCisco, SiUber, SiAirbnb, SiSpotify, SiOracle, SiBaidu, SiHuawei, SiXiaomi, SiDell, SiHp, SiLenovo, SiVmware, SiOpenai, SiDigitalocean, SiCloudflare, SiFastly, SiHeroku, SiVercel, SiNetlify, SiKubernetes, SiIntel, SiAccenture, SiCognizant, SiSap, SiTwilio, SiHubspot, SiPagerduty, SiElastic, SiMongodb, SiSnowflake, SiDatabricks, SiCloudera, SiPaloaltonetworks, SiCrowdstrike, SiOkta, SiZscaler, SiF5, SiJuniper, SiAvaya, SiNokia, SiEricsson, SiAlibaba, SiAlibabacloud, SiMercadopago, SiRakuten, SiLine, SiNaver, SiYandex, SiMailchimp, SiSendgrid, SiBrave, SiOpera, SiEclipseide, SiJetbrains, SiPostman, SiSwagger, SiFigma, SiSketch, SiAdobexd, SiInvision, SiJira, SiConfluence, SiAsana, SiAirtable, SiNotion, SiEvernote, SiGrammarly, SiDuolingo, SiUdemy, SiCoursera, SiKhanacademy, SiPluralsight, SiLinkedin, SiGlassdoor, SiIndeed, SiUpwork, SiFreelancer, SiFiverr, SiStackoverflow, SiMedium, SiQuora, SiHashnode, SiDevdotto, SiCodepen, SiReplit, SiGlitch, SiCodesandbox, SiLeetcode, SiHackerrank, SiAlgolia, SiAuth0, SiFirebase, SiSupabase, SiHasura, SiGraphql, SiApache, SiNginx, SiRedis, SiRabbitmq, SiKafka, SiPrometheus, SiGradle, SiMaven, SiGnubash, SiGit, SiJquery, SiRedux, SiWebpack, SiBabel, SiEslint, SiPrettier, SiJest, SiCypress, SiPuppeteer, SiStorybook, SiLoom, SiZoom, SiGoogledrive, SiOnedrive, SiDropbox, SiTorbrowser, SiProtonmail, SiTutanota, SiBitcoin, SiEthereum, SiBinance, SiCoinbase, SiRipple, SiPolkadot, SiSolana, SiChainlink, SiAlgorand, SiStellar, SiMonero, SiZcash
  } from "react-icons/si";
  
  // Add these if needed (from other icon libraries):
  import { MdSecurity, MdCloud, MdStorage, MdCode } from "react-icons/md";
  import { GiArtificialIntelligence } from "react-icons/gi";
  
  const companies = [
    // Top Companies (Cloud, Tech, Dev Tools)
    { label: "Amazon", icon: FaAmazon },
    { label: "Google", icon: FaGoogle },
    { label: "Microsoft", icon: FaMicrosoft },
    { label: "Apple", icon: FaApple },
    { label: "Facebook", icon: FaFacebook },
    { label: "Atlassian", icon: FaAtlassian },
    { label: "Uber", icon: SiUber },
    { label: "PayPal", icon: FaPaypal },
    { label: "Airbnb", icon: SiAirbnb },
    { label: "Salesforce", icon: FaSalesforce },
    { label: "Docker", icon: FaDocker },
    { label: "Stripe", icon: FaStripe },
    { label: "Spotify", icon: SiSpotify },
    { label: "Oracle", icon: SiOracle },
    { label: "GitHub", icon: FaGithub },
    { label: "GitLab", icon: FaGitlab },
    { label: "Slack", icon: FaSlack },
    { label: "Dropbox", icon: FaDropbox },
    { label: "Shopify", icon: FaShopify },
    { label: "Dropbox", icon: FaDropbox },
    { label: "Trello", icon: FaTrello },
    { label: "Cisco", icon: SiCisco },
    { label: "NVIDIA", icon: SiNvidia },
    { label: "Intel", icon: SiIntel },
    { label: "Samsung", icon: SiSamsung },
    { label: "Dell", icon: SiDell },
    { label: "HP", icon: SiHp },
    { label: "Lenovo", icon: SiLenovo },
    { label: "VMware", icon: SiVmware },
    { label: "DigitalOcean", icon: SiDigitalocean },
    { label: "Cloudflare", icon: SiCloudflare },
    { label: "Heroku", icon: SiHeroku },
    { label: "Vercel", icon: SiVercel },
    { label: "Netlify", icon: SiNetlify },
    { label: "Kubernetes", icon: SiKubernetes },
    { label: "IBM", icon: SiIbm },
  
    // Regional Tech Companies
    { label: "TCS", icon: SiTata },
    { label: "Infosys", icon: SiInfosys },
    { label: "Wipro", icon: SiWipro },
    { label: "HCL", icon: SiHcl },
    { label: "Tech Mahindra", icon: SiTechmahindra },
    { label: "Zoho", icon: SiZoho },
    { label: "Freshworks", icon: SiFreshworks },
  
    // Developer Tools & Services
    { label: "JetBrains", icon: SiJetbrains },
    { label: "Postman", icon: SiPostman },
    { label: "Figma", icon: SiFigma },
    { label: "Swagger", icon: SiSwagger },
    { label: "GitLab", icon: FaGitlab },
    { label: "Bitbucket", icon: FaBitbucket },
  
    // Cloud & DevOps Services
    { label: "Alibaba Cloud", icon: SiAlibabacloud },
    { label: "OVHcloud", icon: SiOvh },
    { label: "Linode", icon: SiLinode },
    { label: "Scaleway", icon: SiScaleway },
  
    // Cybersecurity
    { label: "Kaspersky", icon: MdSecurity },
    { label: "Norton", icon: MdSecurity },
    { label: "Malwarebytes", icon: MdSecurity },
  
    // AI/ML
    { label: "DeepMind", icon: GiArtificialIntelligence },
    { label: "OpenCV", icon: SiOpencv },
    { label: "Hugging Face", icon: SiHuggingface },
  
    // Blockchain
    { label: "Binance", icon: SiBinance },
    { label: "Coinbase", icon: SiCoinbase },
    { label: "Polkadot", icon: SiPolkadot },
  
    // Regional Tech Companies (continued)
    { label: "MercadoLibre", icon: SiMercadopago },
    { label: "Rakuten", icon: SiRakuten },
    { label: "Naver", icon: SiNaver },
    { label: "Yandex", icon: SiYandex },
  
    // Telecom
    { label: "Verizon", icon: SiVerizon },
    { label: "AT&T", icon: SiAtt },
    { label: "Vodafone", icon: SiVodafone },
  
    // Open Source
    { label: "Apache Foundation", icon: SiApache },
    { label: "Linux Foundation", icon: FaLinux },
    { label: "GNOME", icon: SiGnome },
  ];
  
  export default companies;
  