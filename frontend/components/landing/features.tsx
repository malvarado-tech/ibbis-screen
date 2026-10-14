import { Zap, Shield, Code, CheckCircle } from "lucide-react"

export function Features() {
  const features = [
    {
      title: "Browser Workflow",
      description: "Paste or upload a FASTA sequence and follow each screening step as it runs, with no command line.",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Runs commec",
      description: "The back end runs IBBIS's open-source Common Mechanism (commec) in a Docker container.",
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      title: "REST API",
      description: "Submit, poll and download JSON or HTML reports through a FastAPI service with OpenAPI docs.",
      icon: Code,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Readable Results",
      description: "A PASS, FLAG or WARNING verdict with a sequence map and the regions behind it.",
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ textWrap: "balance" }}>What It Does</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A web front end for commec, for people who do not work on the command line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className={`h-11 w-11 shrink-0 rounded-lg ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mt-0.5`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
