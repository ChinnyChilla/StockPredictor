"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead, TableFooter } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Camera, Loader, Utensils, Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface NutrientFacts {
	food_name: string;
	serving_qty: number;
	serving_unit: string;
	calories: number;
	total_fat: number;
	cholesterol: number;
	protein: number;
	sodium: number;
	total_carbohydrate: number;
	sugars: number;
}

interface LoggedItem extends NutrientFacts {
	id: number;
}

const CameraPreview = ({ onTakePhoto }: { onTakePhoto: (dataUri: string) => void }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: { facingMode: 'environment' } })
			.then((stream) => {
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			})
			.catch((err) => {
				console.error("Camera access error:", err);
				setError("Could not access the camera. Please check permissions and try again.");
			});

		return () => {
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				stream.getTracks().forEach(track => track.stop());
			}
		};
	}, []);

	const handleTakePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const canvas = canvasRef.current;
			const video = videoRef.current;
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const context = canvas.getContext('2d');
			if (context) {
				context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
				onTakePhoto(canvas.toDataURL('image/png'));
			}
		}
	};

	if (error) {
		return <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;
	}

	return (
		<div className="relative w-full h-full bg-black overflow-hidden">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				className="w-full h-full object-cover"
			/>
			<Button onClick={handleTakePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
				<Camera className="mr-2 h-4 w-4" /> Take Photo
			</Button>
			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
};

const NutrientsTable = ({ nutrients }: { nutrients: NutrientFacts }) => (
	<div>
		<Table>
			<TableBody>
				<TableRow><TableCell className="font-medium">Calories</TableCell><TableCell className="text-right">{nutrients.calories?.toFixed(2)}</TableCell></TableRow>
				<TableRow><TableCell className="font-medium">Total Fat</TableCell><TableCell className="text-right">{nutrients.total_fat?.toFixed(2)} g</TableCell></TableRow>
				<TableRow><TableCell className="font-medium">Cholesterol</TableCell><TableCell className="text-right">{nutrients.cholesterol?.toFixed(2)} mg</TableCell></TableRow>
				<TableRow><TableCell className="font-medium">Sodium</TableCell><TableCell className="text-right">{nutrients.sodium?.toFixed(2)} mg</TableCell></TableRow>
				<TableRow><TableCell className="font-medium">Total Carbs</TableCell><TableCell className="text-right">{nutrients.total_carbohydrate?.toFixed(2)} g</TableCell></TableRow>
				<TableRow><TableCell className="font-medium">Sugars</TableCell><TableCell className="text-right">{nutrients.sugars?.toFixed(2)} g</TableCell></TableRow>
				<TableRow><TableCell className="font-medium">Protein</TableCell><TableCell className="text-right">{nutrients.protein?.toFixed(2)} g</TableCell></TableRow>
			</TableBody>
		</Table>
	</div>
);

// Main Page Component
export default function FoodiPage() {
	const [nutrients, setNutrients] = useState<NutrientFacts | null>(null);
	const [dailyLog, setDailyLog] = useState<LoggedItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [servingCount, setServingCount] = useState(1);

	useEffect(() => {
		const today = new Date().toISOString().split('T')[0];
		const savedLog = Cookies.get(`foodiLog-${today}`);
		if (savedLog) {
			setDailyLog(JSON.parse(savedLog));
		}
	}, []);

	useEffect(() => {
		const today = new Date().toISOString().split('T')[0];
		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999);
		Cookies.set(`foodiLog-${today}`, JSON.stringify(dailyLog), { expires: endOfDay });
	}, [dailyLog]);

	const handleTakePhoto = async (dataUri: string) => {
		setIsModalOpen(true);
		setLoading(true);
		setError(null);
		setNutrients(null);
		setServingCount(1);

		try {
			const response = await fetch("/api/foodi/getNutrients", {
				method: "POST",
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ image: dataUri }),
			});

			if (!response.ok) throw new Error("Failed to get nutrient data.");

			const data = await response.json();
			if (data) {
				setNutrients(data);
			} else {
				throw new Error("Could not identify food in the image.");
			}
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred.");
		} finally {
			setLoading(false);
		}
	};

	const displayNutrients = useMemo(() => {
		if (!nutrients) return null;

		const count = Number(servingCount) || 0;

		return {
			...nutrients,
			calories: (nutrients.calories || 0) * count,
			total_fat: (nutrients.total_fat || 0) * count,
			cholesterol: (nutrients.cholesterol || 0) * count,
			protein: (nutrients.protein || 0) * count,
			sodium: (nutrients.sodium || 0) * count,
			total_carbohydrate: (nutrients.total_carbohydrate || 0) * count,
			sugars: (nutrients.sugars || 0) * count,
		};
	}, [nutrients, servingCount]);

	const handleSaveLog = () => {
		if (displayNutrients) {
			const logEntry = {
				...displayNutrients,
				food_name: `${displayNutrients.food_name} (${servingCount} servings)`,
				id: Date.now()
			};
			setDailyLog(prevLog => [...prevLog, logEntry]);
			setIsModalOpen(false);
		}
	};

	const handleRemoveLogItem = (id: number) => {
		setDailyLog(prevLog => prevLog.filter(item => item.id !== id));
	};

	const totals = dailyLog.reduce((acc, item) => {
		acc.calories += item.calories || 0;
		acc.protein += item.protein || 0;
		acc.total_fat += item.total_fat || 0;
		acc.total_carbohydrate += item.total_carbohydrate || 0;
		acc.sugars += item.sugars || 0;
		acc.cholesterol += item.cholesterol || 0;
		acc.sodium += item.sodium || 0;
		return acc;
	}, { calories: 0, protein: 0, total_fat: 0, total_carbohydrate: 0, sugars: 0, cholesterol: 0, sodium: 0 });

	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-8">
			<header className="text-center mb-8">
				<h1 className="text-4xl font-bold tracking-tight">Foodi</h1>
				<p className="text-muted-foreground">Snap a photo of your food to get its nutritional facts.
					<br /> - By Michael Zheng, Wilson Huang, and Aryan Jain.
				</p>
			</header>

			<div className="flex justify-center mb-12">
				<div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
					<div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
					<div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
					<div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
					<div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
					<div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800">
						<CameraPreview onTakePhoto={handleTakePhoto} />
					</div>
				</div>
			</div>

			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{loading ? "Analyzing..." : nutrients ? nutrients.food_name : "Error"}</DialogTitle>
						{nutrients && (
							<DialogDescription>
								Base nutritional info for {nutrients.serving_qty} {nutrients.serving_unit}.
							</DialogDescription>
						)}
					</DialogHeader>

					{loading && <div className="flex justify-center items-center h-48"><Loader className="h-12 w-12 animate-spin" /></div>}
					{error && <div className="p-4 text-center text-red-500">{error}</div>}

					{displayNutrients && !loading && (
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<label htmlFor="servings" className="font-medium">Servings:</label>
								<Input
									id="servings"
									type="number"
									value={servingCount}
									onChange={(e) => setServingCount(parseFloat(e.target.value))}
									className="w-24 text-center"
									min="0.1"
									step="0.1"
								/>
								<span className="text-muted-foreground">
									x {nutrients?.serving_qty} {nutrients?.serving_unit}
								</span>
							</div>
							<NutrientsTable nutrients={displayNutrients} />
						</div>
					)}

					<DialogFooter>
						<DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
						{displayNutrients && !loading && <Button onClick={handleSaveLog}>Save</Button>}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<section>
				<h2 className="text-2xl font-semibold text-center mb-4">Today's Log</h2>
				<Card>
					<CardContent className="p-4">
						{dailyLog.length > 0 ? (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Food</TableHead>
										<TableHead className="text-right">Calories</TableHead>
										<TableHead className="text-right">Fat (g)</TableHead>
										<TableHead className="text-right">Carbs (g)</TableHead>
										<TableHead className="text-right">Sugars (g)</TableHead>
										<TableHead className="text-right">Protein (g)</TableHead>
										<TableHead className="text-right">Chol (mg)</TableHead>
										<TableHead className="text-right">Sodium (mg)</TableHead>
										<TableHead className="w-[50px]"></TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{dailyLog.map(item => (
										<TableRow key={item.id}>
											<TableCell className="font-medium">{item.food_name}</TableCell>
											<TableCell className="text-right">{item.calories.toFixed(0)}</TableCell>
											<TableCell className="text-right">{item.total_fat.toFixed(1)}</TableCell>
											<TableCell className="text-right">{item.total_carbohydrate.toFixed(1)}</TableCell>
											<TableCell className="text-right">{item.sugars.toFixed(1)}</TableCell>
											<TableCell className="text-right">{item.protein.toFixed(1)}</TableCell>
											<TableCell className="text-right">{item.cholesterol.toFixed(0)}</TableCell>
											<TableCell className="text-right">{item.sodium.toFixed(0)}</TableCell>
											<TableCell>
												<Button variant="ghost" size="icon" onClick={() => handleRemoveLogItem(item.id)}>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
								<TableFooter>
									<TableRow>
										<TableHead>Total</TableHead>
										<TableHead className="text-right">{totals.calories.toFixed(0)}</TableHead>
										<TableHead className="text-right">{totals.total_fat.toFixed(1)}</TableHead>
										<TableHead className="text-right">{totals.total_carbohydrate.toFixed(1)}</TableHead>
										<TableHead className="text-right">{totals.sugars.toFixed(1)}</TableHead>
										<TableHead className="text-right">{totals.protein.toFixed(1)}</TableHead>
										<TableHead className="text-right">{totals.cholesterol.toFixed(0)}</TableHead>
										<TableHead className="text-right">{totals.sodium.toFixed(0)}</TableHead>
										<TableHead></TableHead>
									</TableRow>
								</TableFooter>
							</Table>
						) : (
							<div className="text-center text-muted-foreground p-8">
								<Utensils className="mx-auto h-12 w-12 mb-4" />
								<p>No items logged yet today. Use the camera to scan a food item.</p>
							</div>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
