
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, MapPin, Phone, Code } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">About Us</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          The story and the creators behind Shega Cafe.
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            Creator Information
          </CardTitle>
          <CardDescription>This application was brought to life by dedicated creators.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-primary" />
                <p><span className="font-semibold">Shikret Advert</span></p>
            </div>
            <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-primary" />
                <p><span className="font-semibold">Natnael Berhanu and  Yibeltal Belay</span></p>
            </div>
            <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-primary" />
                <p>Debre Berhan, Ethiopia</p>
            </div>
            <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary" />
                <p>0940219376</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
