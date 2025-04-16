import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  ArrowRight,
  Check,
  Star,
  Users,
  Heart,
  Rocket,
  Shield,
  Zap,
  MessageSquare,
  Clock,
  Bookmark,
  BadgeCheck,
  UserCheck,
  CheckCircle,
  Award,
  CheckCheck,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ProjectsWithFilters from "./_components/project/projectsWithFilters"
import { BackgroundBeams } from "./_components/global/backgroundBeams"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1F2937] to-[#1E3A8A] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <BackgroundBeams/>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Where <span className="text-[#93C5FD]">Credible</span> Ideas Get Funded
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of creators and backers to launch innovative projects and support ideas that matter to
              you, all with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-accentColor hover:bg-accentColor/50">
                <Link href={"projects/new"}>
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-black border-white hover:bg-white/90">
                <Link href={"/projects/discover"}>
                  Explore Projects
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#93C5FD]">10K+</p>
              <p className="text-gray-300">Projects Funded</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#93C5FD]">250M+DA</p>
              <p className="text-gray-300">Money Raised</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#93C5FD]">2M+</p>
              <p className="text-gray-300">Backers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#93C5FD]">100+</p>
              <p className="text-gray-300">Experts</p>
            </div>
          </div>

          {/* Trusted By */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-400 mb-4">TRUSTED BY INNOVATIVE BRANDS</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-[#3B82F6] mb-4">Our Unique Approach</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Expert Validation System</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform stands out by connecting projects with industry experts who validate their viability,
              technology, and market potential before they go live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-t-4 border-t-[#3B82F6]">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Matching</h3>
                <p className="text-gray-600">
                  Projects are matched with relevant industry experts who have verified credentials and experience in
                  the specific field.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-[#3B82F6]">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Thorough Validation</h3>
                <p className="text-gray-600">
                  Experts review technical feasibility, market potential, team capabilities, and provide detailed
                  feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-[#3B82F6]">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-[#3B82F6]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Validation Badge</h3>
                <p className="text-gray-600">
                  Approved projects receive a validation badge that signals credibility and increases backer confidence.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="relative h-64 w-64 mx-auto">
                  <Image
                    src="/experts.jpg"
                    alt="Expert validation process"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-[#3B82F6] text-white p-3 rounded-full">
                    <BadgeCheck className="h-8 w-8" />
                  </div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">The Validation Difference</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <Check className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                    <p>
                      <span className="font-semibold">87% higher success rate</span> for expert-validated projects
                      compared to non-validated ones
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <Check className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                    <p>
                      <span className="font-semibold">3.5x more funding</span> received on average by projects with
                      expert validation badges
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <Check className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                    <p>
                      <span className="font-semibold">92% of backers</span> say expert validation is a key factor in
                      their decision to support a project
                    </p>
                  </div>
                </div>
                <Button className="mt-6 bg-[#3B82F6] hover:bg-[#1E3A8A]">Learn About Our Validation Process</Button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Projects Carousel */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Projects</h2>
              <p className="text-gray-600">Discover the newest additions to our platform</p>
            </div>
            <Button className="bg-accentColor hover:bg-[#1E3A8A]">View All Projects</Button>
          </div>

          <ProjectsWithFilters page="" search="" limit="" categories={[]} sort="-launched_at"/>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Explore by Category</h2>
            <p className="text-gray-600">Find projects that match your interests</p>
          </div>

          <div className="relative mx-auto max-w-6xl px-8">
            <Carousel opts={{ align: "start", loop: true }}>
              <CarouselContent>
                {categories.map((category, index) => (
                  <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                    <div className="p-1">
                      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="relative h-32">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                            <h3 className="text-white font-medium">{category.name}</h3>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex">
                <CarouselPrevious className="relative -left-4" />
                <CarouselNext className="relative -right-4" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Projects by Category */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Technology Projects</h2>
              <p className="text-gray-600">Innovative solutions changing the world</p>
            </div>
            <Button variant="outline">View All in Technology</Button>
          </div>

          <ProjectsWithFilters page="" search="" limit="" categories={["technology"]} sort=""/>
        </div>
      </section>

      {/* Creative Projects */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Creative Projects</h2>
              <p className="text-gray-600">Art, Writing, Film & More</p>
            </div>
            <Button variant="outline">View All Creative Projects</Button>
          </div>

          <ProjectsWithFilters page="" search="" limit="" categories={["art", "design", "film & video", "publishing & writing", "food & craft"]} sort=""/>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Innovative Creators</h2>
            <p className="text-gray-600">Join thousands of successful projects that got their start here</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">{testimonial.text}</p>
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Our Platform?</h2>
              <div className="space-y-6">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                        {benefit.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                src="/why.jpg"
                alt="Platform features"
                width={600}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features to Help You Succeed</h2>
            <p className="text-gray-600">Everything you need to launch and grow your crowdfunding campaign</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Note */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <Image
                  src="/me.jpeg"
                  alt="Founder"
                  width={200}
                  height={200}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-bold mb-4">A Note from Our Founder</h2>
                  <p className="text-gray-600 mb-4">
                    "We built this platform because we believe everyone deserves a chance to bring their ideas to life.
                    Our mission is to empower creators and innovators by connecting them with the community and
                    resources they need to succeed. On top of that people needs more factors to trust creators and their projects, thus we provided our best feature which is experts validation, to boost confidence into backers to fund the projects they love."
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">Issam Hosni</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-gray-600">Founder & CEO</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our platform</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#1F2937] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who have successfully funded their projects and built thriving communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accentColor hover:bg-accentColor/50">
              <Link href={"/projects/new"}>
                Launch Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-accentColor">
                    Facebook
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} CertiFund. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const testimonials = [
  {
    text: "This platform helped me raise over $100K for my sustainable fashion project. The support from the community was incredible!",
    name: "Emily Chen",
    role: "Fashion Designer",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    text: "The tools and resources provided made it easy to create and manage my campaign. Highly recommended for first-time creators.",
    name: "Marcus Rodriguez",
    role: "Tech Entrepreneur",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    text: "What sets this platform apart is the amazing community. The feedback and support I received was invaluable. Totally recommended.",
    name: "Sarah Thompson",
    role: "Game Developer",
    avatar: "/placeholder.svg?height=48&width=48",
  },
]

const benefits = [
  {
    icon: <Users className="h-6 w-6 text-accentColor" />,
    title: "Built-in Community",
    description: "Connect with backers who are passionate about your project and ready to support your journey.",
  },
  {
    icon: <Heart className="h-6 w-6 text-accentColor" />,
    title: "Creator-First Approach",
    description: "We provide the tools and resources you need to succeed, from campaign setup to project fulfillment.",
  },
  {
    icon: <Rocket className="h-6 w-6 text-accentColor" />,
    title: "Launch with Confidence",
    description: "Our platform is designed to help you reach your funding goals and bring your ideas to life.",
  },
]

const features = [
  {
    icon: <CheckCheck className="h-6 w-6 text-accentColor" />,
    title: "Expert validation",
    description: "Get your project reviewed by industry experts to build credibility and earn backers' trust.",
  },
  {
    icon: <Shield className="h-6 w-6 text-accentColor" />,
    title: "Secure Payments",
    description: "Industry-leading security measures to protect you and your backers.",
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-accentColor" />,
    title: "Community Tools",
    description: "Engage with your backers through updates and comments",
  },
]

const faqs = [
  {
    question: "How does crowdfunding work?",
    answer:
      "Crowdfunding allows creators to raise funds for their projects by collecting small amounts of money from a large number of people. You set a funding goal, create a campaign page, and share your story with potential backers.",
  },
  {
    question: "What types of projects can I fund?",
    answer:
      "We support a wide range of projects including technology, art, music, film, design, games, and more. As long as your project has a clear goal and timeline, it's welcome on our platform.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Once your campaign reaches its funding goal, we transfer the funds directly to your connected bank account, minus our platform fee. We support various payment methods and currencies.",
  },
  {
    question: "What happens if I don't reach my funding goal?",
    answer:
      "We use an all-or-nothing funding model. If you don't reach your goal, no money is collected from your backers, and you can try again with a new campaign.",
  },
]

const categories = [
  { name: "Technology", image: "/tech.jpg" },
  { name: "Art", image: "/art.jpg" },
  { name: "Games", image: "/games.jpg" },
  { name: "Film & Video", image: "/films.jpg" },
  { name: "Publishing", image: "/writing.jpg" },
  { name: "Design", image: "/design.jpg" },
  { name: "Food & Craft", image: "/food.jpg" },
  { name: "Social Good", image: "/good.jpg" },
  { name: "Miscellaneous", image: "/misc.jpg" },
]

const featuredProjects = [
  {
    title: "EcoSmart Home Energy System",
    description:
      "A revolutionary smart home system that reduces energy consumption by up to 40% through AI-powered optimization.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 85000,
    goal: 100000,
    backers: 342,
    daysLeft: 15,
    category: "Technology",
  },
  {
    title: "Harmonic: The Interactive Music Experience",
    description:
      "An immersive app that transforms how you create, learn, and experience music through interactive visualizations.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 32000,
    goal: 50000,
    backers: 189,
    daysLeft: 21,
    category: "Music",
  },
  {
    title: "Mythic Realms: Strategy Board Game",
    description:
      "A beautifully crafted strategy board game with unique characters, immersive storytelling, and endless replayability.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 120000,
    goal: 150000,
    backers: 1205,
    daysLeft: 8,
    category: "Games",
  },
  {
    title: "Ocean Plastic Recycler",
    description:
      "An innovative device that collects and processes ocean plastic into reusable materials for manufacturing.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 95000,
    goal: 120000,
    backers: 523,
    daysLeft: 12,
    category: "Social Good",
  },
]

const technologyProjects = [
  {
    title: "NeuralLink: AI-Powered Health Monitor",
    description:
      "A wearable device that uses artificial intelligence to monitor vital signs and predict potential health issues.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 125000,
    goal: 150000,
    backers: 876,
    daysLeft: 18,
  },
  {
    title: "SolarFlex: Portable Solar Power Station",
    description:
      "Ultra-lightweight, foldable solar panels with high-efficiency power conversion for outdoor adventures and emergency backup.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 89000,
    goal: 100000,
    backers: 412,
    daysLeft: 9,
  },
  {
    title: "AquaPure: Smart Water Filtration System",
    description:
      "An IoT-enabled water filtration system that monitors water quality and automatically adjusts filtration levels.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 45000,
    goal: 60000,
    backers: 231,
    daysLeft: 25,
  },
  {
    title: "EcoCharge: Biodegradable Batteries",
    description:
      "Revolutionary eco-friendly batteries made from sustainable materials that decompose naturally after use.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 72000,
    goal: 80000,
    backers: 358,
    daysLeft: 14,
  },
]

const creativeProjects = [
  {
    title: "Chromatic Dreams: Art Book Collection",
    description: "A stunning collection of surrealist artwork exploring the boundaries between dreams and reality.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 18000,
    goal: 25000,
    backers: 142,
    daysLeft: 30,
    category: "Art",
  },
  {
    title: "Echoes of Tomorrow: Sci-Fi Anthology",
    description:
      "A collection of thought-provoking short stories from emerging sci-fi writers exploring our possible futures.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 12000,
    goal: 15000,
    backers: 98,
    daysLeft: 22,
    category: "Publishing",
  },
  {
    title: "Resonance: Experimental Music Album",
    description:
      "An innovative album blending classical instruments with electronic production and environmental sounds.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 8500,
    goal: 10000,
    backers: 76,
    daysLeft: 11,
    category: "Music",
  },
  {
    title: "Perspectives: Documentary Series",
    description:
      "A documentary series exploring untold stories from communities around the world facing environmental challenges.",
    image: "/placeholder.svg?height=200&width=400",
    raised: 35000,
    goal: 50000,
    backers: 210,
    daysLeft: 19,
    category: "Film & Video",
  },
]

